import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listRecentInquiries } from "../../services/inquiryFirestoreService";
import { setInquiryHidden } from "../../services/moderationService";

function AdminInquiriesPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setRows(await listRecentInquiries(60));
    } catch (e) {
      setError(e?.message || "Could not load inquiries.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Inquiries</h1>
      <p className="mt-1 text-sm text-slate-600">
        Recent platform threads. Hide abusive conversations from participants.
      </p>
      {error ? (
        <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {error}
        </p>
      ) : null}
      <ul className="mt-6 space-y-2">
        {loading ? (
          <li className="text-sm text-slate-500">Loading…</li>
        ) : rows.length === 0 ? (
          <li className="text-sm text-slate-500">No inquiries yet.</li>
        ) : (
          rows.map((r) => (
            <li
              key={r.inquiryId}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold">{r.productName}</p>
                  <p className="text-sm text-slate-600">
                    {r.buyerName} · {r.status}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                    {r.preview}
                  </p>
                  {r.productId ? (
                    <Link
                      to={`/inquiry/${encodeURIComponent(r.productId)}`}
                      className="mt-1 inline-block text-xs font-semibold text-[#0F6B36] hover:underline"
                    >
                      Open buyer thread
                    </Link>
                  ) : null}
                </div>
                <button
                  type="button"
                  disabled={busyId === r.inquiryId}
                  className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                  onClick={async () => {
                    setBusyId(r.inquiryId);
                    try {
                      await setInquiryHidden(r.inquiryId, true);
                      await load();
                    } catch (e) {
                      setError(e?.message || "Hide failed.");
                    } finally {
                      setBusyId("");
                    }
                  }}
                >
                  Hide
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default AdminInquiriesPage;
