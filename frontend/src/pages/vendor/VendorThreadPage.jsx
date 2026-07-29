import { useCallback, useEffect, useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import InquiryComposer from "../../components/inquiry/InquiryComposer";
import InquiryMessageThread from "../../components/inquiry/InquiryMessageThread";
import { useAuth } from "../../context/AuthContext";
import { getInquiry } from "../../services/inquiryFirestoreService";
import {
  sendVendorMessage,
  subscribeMessages,
} from "../../services/inquiryChatApi";

function normalizeMessage(m) {
  const createdAt =
    typeof m.createdAt === "number"
      ? m.createdAt
      : new Date(m.createdAt ?? m.created_at).getTime();
  return {
    id: String(m.id ?? m._id ?? `${createdAt}`),
    role: m.role === "vendor" ? "vendor" : "buyer",
    senderName:
      m.senderName ?? m.sender_name ?? (m.role === "vendor" ? "You" : "Buyer"),
    senderRole: m.senderRole ?? m.sender_role,
    body: m.body ?? m.text ?? m.message ?? "",
    createdAt: Number.isFinite(createdAt) ? createdAt : Date.now(),
  };
}

function VendorThreadPage() {
  const { inquiryId } = useParams();
  const { shopId, profile } = useOutletContext();
  const { user } = useAuth();
  const [inquiry, setInquiry] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadError("");
      try {
        const row = await getInquiry(inquiryId);
        if (cancelled) return;
        if (!row) {
          setLoadError("Inquiry not found.");
          return;
        }
        if (shopId && row.shopId && row.shopId !== shopId) {
          setLoadError("This lead belongs to another shop.");
          return;
        }
        setInquiry(row);
      } catch (e) {
        console.error(e);
        if (!cancelled) setLoadError("Could not load inquiry.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [inquiryId, shopId]);

  useEffect(() => {
    if (!inquiryId || loadError) return undefined;
    return subscribeMessages(
      { inquiryId },
      (raw) => setMessages((raw ?? []).map(normalizeMessage)),
      (err) => {
        console.error(err);
        setLoadError(err?.message || "Message sync failed.");
      }
    );
  }, [inquiryId, loadError]);

  const onSend = useCallback(
    async (body) => {
      if (!inquiryId || !user?.uid) return;
      setSending(true);
      setSendError("");
      try {
        await sendVendorMessage({
          inquiryId,
          body,
          vendorName: profile?.displayName || "Vendor",
          vendorUid: user.uid,
        });
      } catch (e) {
        console.error(e);
        setSendError(e?.message || "Failed to send.");
      } finally {
        setSending(false);
      }
    },
    [inquiryId, user, profile]
  );

  if (loadError) {
    return (
      <div>
        <Link
          to="/vendor/inbox"
          className="text-sm font-semibold text-[#0F6B36] hover:underline"
        >
          ← Inbox
        </Link>
        <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {loadError}
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] flex-col">
      <div className="mb-4">
        <Link
          to="/vendor/inbox"
          className="text-sm font-semibold text-[#0F6B36] hover:underline"
        >
          ← Inbox
        </Link>
        <h1 className="mt-2 text-xl font-extrabold text-slate-900">
          {inquiry?.productName || "Lead"}
        </h1>
        <p className="text-sm text-slate-600">
          {inquiry?.buyerName || "Buyer"}
          {inquiry?.phone ? ` · ${inquiry.phone}` : ""}
        </p>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex-1 overflow-y-auto px-3 py-4 md:px-5">
          <InquiryMessageThread
            messages={messages}
            currentRole="vendor"
          />
        </div>
        {sendError ? (
          <p className="border-t border-rose-100 bg-rose-50 px-4 py-2 text-xs text-rose-800">
            {sendError}
          </p>
        ) : null}
        <InquiryComposer onSend={onSend} sending={sending} />
      </div>
    </div>
  );
}

export default VendorThreadPage;
