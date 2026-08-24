import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { buildInquiryProductView } from "../lib/inquiryProductView";
import { siteContent } from "../data/inquiryData";
import {
  createInquiry,
  fetchMessages,
  findBuyerProductInquiry,
  getInquiryBackend,
  loadStoredInquiry,
  sendBuyerMessage,
  subscribeMessages,
  usesFirestoreInquiries,
} from "../services/inquiryChatApi";
import AppBottomNav from "../components/AppBottomNav";
import InquiryChatHeader from "../components/inquiry/InquiryChatHeader";
import InquiryComposer from "../components/inquiry/InquiryComposer";
import InquiryMessageThread from "../components/inquiry/InquiryMessageThread";
import InquiryOnboardingForm from "../components/inquiry/InquiryOnboardingForm";
import InquiryProductPanel from "../components/inquiry/InquiryProductPanel";
import ReportControl from "../components/ReportControl";
import { REPORT_TARGET } from "../services/moderationService";

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
    senderName:
      m.senderName ?? m.sender_name ?? (m.role === "vendor" ? "Vendor" : "You"),
    senderRole: m.senderRole ?? m.sender_role,
    body: m.body ?? m.text ?? m.message ?? "",
    createdAt: Number.isFinite(createdAt) ? createdAt : Date.now(),
  };
}

function InquiryChatPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, profile, user, loading: authLoading } = useAuth();
  const [product, setProduct] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [productLoading, setProductLoading] = useState(true);

  const [inquiryId, setInquiryId] = useState(null);
  const [buyerName, setBuyerName] = useState("");
  const [_buyerPhone, setBuyerPhone] = useState("");
  const [messages, setMessages] = useState([]);
  const [onboardingSubmitting, setOnboardingSubmitting] = useState(false);
  const [onboardingError, setOnboardingError] = useState("");
  const [sending, setSending] = useState(false);

  const requireAuth = usesFirestoreInquiries() || getInquiryBackend() === "rest";
  const view = useMemo(() => buildInquiryProductView(product), [product]);
  const shopId = product?.shopId || product?.shop_id || "";

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

  // Resume existing thread (local demo / session / Firestore for this buyer+product)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setInquiryId(null);
      setMessages([]);

      const stored = loadStoredInquiry(productId);
      if (stored?.messages?.length) {
        if (cancelled) return;
        setInquiryId(stored.inquiryId);
        setBuyerName(stored.buyerName);
        setBuyerPhone(stored.phone);
        setMessages(stored.messages.map(normalizeMessage));
        return;
      }

      if (usesFirestoreInquiries() && user?.uid) {
        try {
          const existing = await findBuyerProductInquiry({
            buyerUid: user.uid,
            productId,
          });
          if (cancelled || !existing) return;
          setInquiryId(existing.inquiryId);
          setBuyerName(existing.buyerName || profile?.displayName || "");
          setBuyerPhone(existing.phone || profile?.phone || "");
          writeSession(productId, {
            inquiryId: existing.inquiryId,
            buyerName: existing.buyerName,
            phone: existing.phone,
            productName: existing.productName,
            vendorName: existing.vendorName,
            vendorLocation: existing.vendorLocation,
          });
        } catch (e) {
          console.error(e);
        }
        return;
      }

      const session = readSession(productId);
      if (session?.inquiryId) {
        if (cancelled) return;
        setInquiryId(session.inquiryId);
        setBuyerName(session.buyerName);
        setBuyerPhone(session.phone ?? "");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [productId, user?.uid, profile?.displayName, profile?.phone]);

  // Realtime (Firestore) or light poll (local/REST)
  useEffect(() => {
    if (!inquiryId) return undefined;
    if (usesFirestoreInquiries()) {
      return subscribeMessages(
        { inquiryId, productId },
        (raw) => setMessages((raw ?? []).map(normalizeMessage)),
        (err) => console.error(err)
      );
    }
    const load = () => {
      void fetchMessages({ inquiryId, productId })
        .then((r) => setMessages((r.messages ?? []).map(normalizeMessage)))
        .catch((err) => console.error(err));
    };
    load();
    const interval = window.setInterval(load, 3000);
    return () => window.clearInterval(interval);
  }, [inquiryId, productId]);

  const handleOnboarding = useCallback(
    async ({ buyerName: name, phone, message }) => {
      setOnboardingError("");
      if (requireAuth && !user?.uid) {
        setOnboardingError("Sign in to start an inquiry.");
        return;
      }
      setOnboardingSubmitting(true);
      try {
        const { inquiryId: id } = await createInquiry({
          productId,
          shopId,
          buyerUid: user?.uid || "",
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
      } catch (e) {
        setOnboardingError(e?.message || "Could not start inquiry.");
      } finally {
        setOnboardingSubmitting(false);
      }
    },
    [productId, product, view, user, shopId, requireAuth]
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
          buyerUid: user?.uid || "",
        });
      } catch (e) {
        console.error(e);
        setOnboardingError(e?.message || "Could not send message.");
      } finally {
        setSending(false);
      }
    },
    [inquiryId, productId, buyerName, user]
  );

  const bottomNav = <AppBottomNav activeItemId="inquiry" />;

  if (productLoading || authLoading) {
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
  const loginPath = `/login?from=${encodeURIComponent(`/inquiry/${productId}`)}`;

  return (
    <div className="flex min-h-screen flex-col bg-background pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">
      <InquiryChatHeader
        vendorName={view.vendorName}
        location={view.location}
        onBack={() => navigate(-1)}
      />
      <div className="border-b border-slate-100 bg-white px-4 py-2">
        <ReportControl
          targetType={
            inquiryId ? REPORT_TARGET.INQUIRY : REPORT_TARGET.PRODUCT
          }
          targetId={inquiryId || productId}
        />
      </div>

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
            requireAuth && !isAuthenticated ? (
              <div className="mx-auto w-full max-w-lg px-4 py-10 text-center">
                <h2 className="text-lg font-extrabold text-[#111827]">
                  Sign in to inquire
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Inquiries are saved to your account so you can continue on any
                  device.
                </p>
                <Link
                  to={loginPath}
                  state={{ from: `/inquiry/${productId}` }}
                  className="mt-6 inline-flex min-h-[44px] items-center rounded-xl bg-[#0F6B36] px-6 text-sm font-semibold text-white"
                >
                  Sign in to continue
                </Link>
              </div>
            ) : (
              <InquiryOnboardingForm
                onSubmit={handleOnboarding}
                submitting={onboardingSubmitting}
                error={onboardingError}
                defaultName={profile?.displayName || ""}
                defaultPhone={profile?.phone || ""}
              />
            )
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
