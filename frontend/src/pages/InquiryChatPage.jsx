import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { buildInquiryProductView } from "../lib/inquiryProductView";
import { siteContent } from "../data/inquiryData";
import {
  createInquiry,
  fetchMessages,
  loadStoredInquiry,
  sendBuyerMessage,
  isInquiryApiConfigured,
} from "../services/inquiryChatApi";
import BottomNav from "../components/BottomNav";
import InquiryChatHeader from "../components/inquiry/InquiryChatHeader";
import InquiryComposer from "../components/inquiry/InquiryComposer";
import InquiryMessageThread from "../components/inquiry/InquiryMessageThread";
import InquiryOnboardingForm from "../components/inquiry/InquiryOnboardingForm";
import InquiryProductPanel from "../components/inquiry/InquiryProductPanel";

const SESSION_KEY = (productId) => `inquiry_session_${productId}`;

function readSession(productId) {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY(productId));
    if (!raw) return null;
    const o = JSON.parse(raw);
    if (!o?.inquiryId || !o?.buyerName) return null;
    return o;
  } catch {
    return null;
  }
}

function writeSession(productId, data) {
  sessionStorage.setItem(SESSION_KEY(productId), JSON.stringify(data));
}

function normalizeMessage(m) {
  const createdAt =
    typeof m.createdAt === "number"
      ? m.createdAt
      : new Date(m.createdAt ?? m.created_at).getTime();
  return {
    id: String(m.id ?? m._id ?? `${createdAt}`),
    role: m.role === "vendor" ? "vendor" : "buyer",
    senderName: m.senderName ?? m.sender_name ?? (m.role === "vendor" ? "Vendor" : "You"),
    senderRole: m.senderRole ?? m.sender_role,
    body: m.body ?? m.text ?? m.message ?? "",
    createdAt: Number.isFinite(createdAt) ? createdAt : Date.now(),
  };
}

function InquiryChatPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [productLoading, setProductLoading] = useState(true);

  const [inquiryId, setInquiryId] = useState(null);
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [messages, setMessages] = useState([]);
  const [onboardingSubmitting, setOnboardingSubmitting] = useState(false);
  const [onboardingError, setOnboardingError] = useState("");
  const [sending, setSending] = useState(false);

  const [activeBottomNavItem, setActiveBottomNavItem] = useState("inquiry");

  const view = useMemo(() => buildInquiryProductView(product), [product]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setProductLoading(true);
      setLoadError("");
      try {
        const docRef = doc(db, "products", productId);
        const snap = await getDoc(docRef);
        if (!snap.exists()) {
          if (!cancelled) setLoadError("Product not found");
        } else if (!cancelled) {
          setProduct({ id: snap.id, ...snap.data() });
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) setLoadError("Could not load product.");
      } finally {
        if (!cancelled) setProductLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  useEffect(() => {
    const stored = loadStoredInquiry(productId);
    if (stored?.messages?.length) {
      setInquiryId(stored.inquiryId);
      setBuyerName(stored.buyerName);
      setBuyerPhone(stored.phone);
      setMessages(stored.messages.map(normalizeMessage));
      return;
    }
    const session = readSession(productId);
    if (session?.inquiryId && isInquiryApiConfigured()) {
      setInquiryId(session.inquiryId);
      setBuyerName(session.buyerName);
      setBuyerPhone(session.phone ?? "");
    }
  }, [productId]);

  const refreshMessages = useCallback(async (id = inquiryId) => {
    if (!id) return;
    try {
      const { messages: raw } = await fetchMessages({ inquiryId: id, productId });
      setMessages((raw ?? []).map(normalizeMessage));
    } catch (e) {
      console.error(e);
    }
  }, [inquiryId, productId]);

  useEffect(() => {
    if (!inquiryId) return undefined;
    void refreshMessages(inquiryId);
    const id = window.setInterval(() => {
      void refreshMessages(inquiryId);
    }, 3000);
    return () => window.clearInterval(id);
  }, [inquiryId, productId, refreshMessages]);

  const handleOnboarding = useCallback(
    async ({ buyerName: name, phone, message }) => {
      setOnboardingError("");
      setOnboardingSubmitting(true);
      try {
        const { inquiryId: id } = await createInquiry({
          productId,
          buyerName: name,
          phone,
          message,
          productName: view?.name || product?.name || "",
          vendorName: view?.vendorName || "",
          vendorLocation: view?.location || "",
        });
        setInquiryId(id);
        setBuyerName(name.trim());
        setBuyerPhone(phone.trim());
        writeSession(productId, {
          inquiryId: id,
          buyerName: name.trim(),
          phone: phone.trim(),
          productName: view?.name || product?.name || "",
          vendorName: view?.vendorName || "",
          vendorLocation: view?.location || "",
        });
        await refreshMessages(id);
      } catch (e) {
        setOnboardingError(e?.message || "Could not start inquiry.");
      } finally {
        setOnboardingSubmitting(false);
      }
    },
    [productId, product, view, refreshMessages]
  );

  const handleSend = useCallback(
    async (body) => {
      if (!inquiryId || !buyerName) return;
      setSending(true);
      try {
        await sendBuyerMessage({
          inquiryId,
          productId,
          buyerName,
          body,
        });
        await refreshMessages();
      } catch (e) {
        console.error(e);
      } finally {
        setSending(false);
      }
    },
    [inquiryId, productId, buyerName, refreshMessages]
  );

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleBottomNav = useCallback(
    (itemId) => {
      setActiveBottomNavItem(itemId);
      if (itemId === "home") navigate("/");
      else if (itemId === "categories") navigate("/");
      else if (itemId === "inquiry") navigate("/inquiries");
    },
    [navigate]
  );

  const bottomNav = (
    <BottomNav
      items={siteContent.bottomNav}
      activeItemId={activeBottomNavItem}
      onItemSelect={handleBottomNav}
    />
  );

  if (productLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#0F6B36] border-t-transparent" />
          <p className="text-sm text-slate-500">Loading…</p>
        </div>
        {bottomNav}
      </div>
    );
  }

  if (loadError || !product || !view) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24">
          <p className="text-center text-sm text-slate-600">
            {loadError || "Product unavailable."}
          </p>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="rounded-xl bg-[#0F6B36] px-6 py-2.5 text-sm font-semibold text-white"
          >
            Back to home
          </button>
        </div>
        {bottomNav}
      </div>
    );
  }

  const hasInquiry = Boolean(inquiryId);

  return (
    <div className="flex min-h-screen flex-col bg-background pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">
      <InquiryChatHeader
        vendorName={view.vendorName}
        location={view.location}
        onBack={handleBack}
      />

      <div className="mx-auto flex min-h-0 w-full max-w-container flex-1 flex-col lg:flex-row">
        <InquiryProductPanel
          view="sidebar"
          name={view.name}
          imageUrl={view.imageUrl}
          specLine={view.specLine}
          isQuoteOnly={view.isQuoteOnly}
          priceLabel={view.priceLabel}
          vendorName={view.vendorName}
          location={view.location}
          verified={view.verified}
          hasInquiry={hasInquiry}
        />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <InquiryProductPanel
            view="strip"
            name={view.name}
            imageUrl={view.imageUrl}
            specLine={view.specLine}
            isQuoteOnly={view.isQuoteOnly}
            priceLabel={view.priceLabel}
            vendorName={view.vendorName}
            location={view.location}
            verified={view.verified}
            hasInquiry={hasInquiry}
          />

          {!hasInquiry ? (
            <InquiryOnboardingForm
              onSubmit={handleOnboarding}
              submitting={onboardingSubmitting}
              error={onboardingError}
            />
          ) : (
            <>
              <InquiryMessageThread messages={messages} />
              <InquiryComposer
                onSend={handleSend}
                disabled={false}
                sending={sending}
              />
            </>
          )}
        </div>
      </div>

      {bottomNav}
    </div>
  );
}

export default InquiryChatPage;
