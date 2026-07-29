import { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { INQUIRY_STATUS } from "../../lib/inquiryStatus";
import {
  filterVendorInbox,
  inboxProductOptions,
} from "../../lib/vendorInbox";
import { subscribeShopInquiries } from "../../services/inquiryFirestoreService";

function formatUpdated(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusLabel(status) {
  if (status === INQUIRY_STATUS.AWAITING_VENDOR) return "Needs reply";
  if (status === INQUIRY_STATUS.AWAITING_BUYER) return "Awaiting buyer";
  if (status === INQUIRY_STATUS.CLOSED) return "Closed";
  return status || "Open";
}

function VendorInboxPage() {
  const { shopId } = useOutletContext();
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [productId, setProductId] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!shopId) {
      setItems([]);
      return undefined;
    }
    setError("");
    return subscribeShopInquiries(
      shopId,
      setItems,
      (err) => setError(err?.message || "Could not load inbox.")
    );
  }, [shopId]);

  const products = useMemo(() => inboxProductOptions(items), [items]);
  const filtered = useMemo(
    () => filterVendorInbox(items, { status, productId, query }),
    [items, status, productId, query]
  );

  if (!shopId) {
    return (
      <p className="text-sm text-slate-500">
        Create and link a shop to receive buyer inquiries.
      </p>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-slate-900">Lead inbox</h1>
      <p className="mt-1 text-sm text-slate-600">
        Filter by status or product, then open a thread to reply.
      </p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search buyer, product, phone…"
          className="min-h-[44px] flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#0F6B36]/40 focus:ring-2 focus:ring-[#0F6B36]/15"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="min-h-[44px] rounded-xl border border-slate-200 bg-white px-3 text-sm"
        >
          <option value="">All statuses</option>
          <option value={INQUIRY_STATUS.AWAITING_VENDOR}>Needs reply</option>
          <option value={INQUIRY_STATUS.AWAITING_BUYER}>Awaiting buyer</option>
          <option value={INQUIRY_STATUS.OPEN}>Open</option>
          <option value={INQUIRY_STATUS.CLOSED}>Closed</option>
        </select>
        <select
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          className="min-h-[44px] rounded-xl border border-slate-200 bg-white px-3 text-sm"
        >
          <option value="">All products</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {error ? (
        <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {error}
        </p>
      ) : null}

      <ul className="mt-6 space-y-2">
        {filtered.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
            No leads match these filters.
          </li>
        ) : (
          filtered.map((row) => (
            <li key={row.inquiryId}>
              <Link
                to={`/vendor/inbox/${encodeURIComponent(row.inquiryId)}`}
                className="block rounded-2xl border border-slate-200 bg-white px-4 py-3 transition-colors hover:border-[#0F6B36]/35 hover:bg-[#f7fbf9]"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-slate-900">
                      {row.productName || "Product"}
                    </p>
                    <p className="mt-0.5 text-sm text-slate-600">
                      {row.buyerName || "Buyer"}
                      {row.phone ? ` · ${row.phone}` : ""}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                      {row.preview || "—"}
                    </p>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    <span
                      className={[
                        "inline-block rounded-lg px-2 py-1 font-semibold",
                        row.status === INQUIRY_STATUS.AWAITING_VENDOR
                          ? "bg-amber-100 text-amber-900"
                          : "bg-slate-100 text-slate-700",
                      ].join(" ")}
                    >
                      {statusLabel(row.status)}
                    </span>
                    <p className="mt-2">{formatUpdated(row.updatedAt)}</p>
                  </div>
                </div>
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default VendorInboxPage;
