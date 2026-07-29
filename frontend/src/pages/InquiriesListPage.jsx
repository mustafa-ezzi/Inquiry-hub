import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { siteContent } from "../data/inquiryData";
import { useAuth } from "../context/AuthContext";
import { fetchMessages, listUserInquiries } from "../services/inquiryChatApi";
import BottomNav from "../components/BottomNav";
import Header from "../components/Header";
import Footer from "../components/Footer";
import InquiryMessageThread from "../components/inquiry/InquiryMessageThread";

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

function formatUpdated(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function InquiriesListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [previewByProduct, setPreviewByProduct] = useState({});
  const [loadingPreview, setLoadingPreview] = useState(null);
  const [activeBottomNavItem, setActiveBottomNavItem] = useState("inquiry");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await listUserInquiries({ buyerUid: user?.uid });
      setItems(list);
    } catch (e) {
      console.error(e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible") void load();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [load]);

  const toggleExpand = useCallback(
    async (row) => {
      if (expandedId === row.productId) {
        setExpandedId(null);
        return;
      }
      setExpandedId(row.productId);
      const hasLocal = row.messages?.length > 0;
      if (hasLocal) {
        setPreviewByProduct((prev) => ({
          ...prev,
          [row.productId]: row.messages.map(normalizeMessage),
        }));
        return;
      }
      setLoadingPreview(row.productId);
      try {
        const { messages: raw } = await fetchMessages({
          inquiryId: row.inquiryId,
          productId: row.productId,
        });
        setPreviewByProduct((prev) => ({
          ...prev,
          [row.productId]: (raw ?? []).map(normalizeMessage),
        }));
      } catch (e) {
        console.error(e);
        setPreviewByProduct((prev) => ({
          ...prev,
          [row.productId]: [],
        }));
      } finally {
        setLoadingPreview(null);
      }
    },
    [expandedId]
  );

  const goChat = useCallback(
    (productId) => {
      navigate(`/inquiry/${encodeURIComponent(productId)}`);
    },
    [navigate]
  );

  const bottomNav = useMemo(
    () => (
      <BottomNav
        items={siteContent.bottomNav}
        activeItemId={activeBottomNavItem}
        onItemSelect={(id) => {
          setActiveBottomNavItem(id);
          if (id === "home" || id === "categories") navigate("/");
          else if (id === "inquiry") void load();
        }}
      />
    ),
    [activeBottomNavItem, load, navigate]
  );

  return (
    <div className="min-h-screen bg-background pb-24 text-slate-900 md:pb-0">
      <Header
        brand={siteContent.brand}
        searchLabel={siteContent.header.searchLabel}
        actions={siteContent.header.actions}
        searchValue=""
        onSearchChange={() => {}}
      />

      <main className="mx-auto max-w-container px-4 py-6 md:px-8 md:py-8">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-[#111827] md:text-2xl">
              My inquiries
            </h1>
            <p className="mt-1 text-sm text-[#6b7280]">
              Tap a row to preview the thread, then open the chat to reply.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            className="self-start rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-[#0F6B36] shadow-sm transition-colors hover:bg-[#f0faf5]"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#0F6B36] border-t-transparent" />
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
            <p className="text-sm font-medium text-[#374151]">No inquiries yet</p>
            <p className="mt-2 text-sm text-[#6b7280]">
              Browse products and tap <span className="font-semibold">Send inquiry</span>{" "}
              to start a conversation.
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[#0F6B36] px-6 text-sm font-bold text-white shadow-sm hover:bg-[#0d5f30]"
            >
              Browse products
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((row) => {
              const open = expandedId === row.productId;
              const preview = previewByProduct[row.productId];
              return (
                <li
                  key={row.productId}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => void toggleExpand(row)}
                    className="flex w-full items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-slate-50/80 md:gap-4 md:px-5"
                  >
                    <span
                      className={[
                        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-transform duration-200",
                        open ? "rotate-90 text-[#0F6B36]" : "",
                      ].join(" ")}
                      aria-hidden
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path
                          d="M5 3l4 4-4 4"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-[#111827]">{row.productName}</p>
                      <p className="mt-0.5 text-xs text-[#6b7280]">
                        {row.vendorName}
                        {row.vendorLocation ? ` · ${row.vendorLocation}` : ""}
                      </p>
                      <p className="mt-2 line-clamp-2 text-sm text-[#374151]">
                        <span className="font-medium text-slate-500">Last: </span>
                        {row.preview || "—"}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        Updated
                      </p>
                      <p className="mt-1 text-xs text-[#6b7280]">
                        {formatUpdated(row.updatedAt)}
                      </p>
                    </div>
                  </button>

                  <div
                    className={[
                      "grid transition-[grid-template-rows] duration-300 ease-out",
                      open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                    ].join(" ")}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <div className="border-t border-slate-100 bg-slate-50/90 px-3 py-4 md:px-5">
                        {loadingPreview === row.productId ? (
                          <div className="flex justify-center py-8">
                            <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#0F6B36] border-t-transparent" />
                          </div>
                        ) : preview?.length ? (
                          <div className="max-h-[min(70vh,420px)] overflow-hidden rounded-xl border border-slate-200 bg-white">
                            <InquiryMessageThread messages={preview} />
                          </div>
                        ) : (
                          <p className="py-6 text-center text-sm text-[#6b7280]">
                            No messages loaded yet.
                          </p>
                        )}
                        <div className="mt-4 flex flex-wrap justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => goChat(row.productId)}
                            className="min-h-[44px] rounded-xl bg-[#0F6B36] px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#0d5f30]"
                          >
                            Open chat
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      <Footer
        brand={siteContent.brand}
        sections={siteContent.footer.sections}
        socialLinks={siteContent.footer.socialLinks}
        note={siteContent.footer.note}
      />
      {bottomNav}
    </div>
  );
}

export default InquiriesListPage;
