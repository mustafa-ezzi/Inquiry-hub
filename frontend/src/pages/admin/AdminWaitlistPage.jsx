import { useCallback, useEffect, useState } from "react";
import { createShop } from "../../services/shopsService";
import { attachShopMembership } from "../../services/authService";
import {
  listWaitlist,
  updateWaitlistStatus,
} from "../../services/vendorWaitlistService";
import { WAITLIST_STATUS } from "../../lib/waitlistValidation";

function AdminWaitlistPage() {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState(WAITLIST_STATUS.PENDING);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setRows(await listWaitlist({ status: status || undefined }));
    } catch (e) {
      setError(e?.message || "Could not load waitlist.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    void load();
  }, [load]);

  const run = async (id, fn) => {
    setBusyId(id);
    setError("");
    try {
      await fn();
      await load();
    } catch (e) {
      setError(e?.message || "Action failed.");
    } finally {
      setBusyId("");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Vendor waitlist</h1>
      <p className="mt-1 text-sm text-slate-600">
        Review applicants. Approve can create a shop and promote the user to vendor.
      </p>
      <div className="mt-4">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="min-h-[40px] rounded-xl border border-slate-200 bg-white px-3 text-sm"
        >
          <option value={WAITLIST_STATUS.PENDING}>Pending</option>
          <option value={WAITLIST_STATUS.CONTACTED}>Contacted</option>
          <option value={WAITLIST_STATUS.APPROVED}>Approved</option>
          <option value={WAITLIST_STATUS.REJECTED}>Rejected</option>
          <option value="">All</option>
        </select>
      </div>
      {error ? (
        <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {error}
        </p>
      ) : null}
      <ul className="mt-6 space-y-3">
        {loading ? (
          <li className="text-sm text-slate-500">Loading…</li>
        ) : rows.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
            No entries for this filter.
          </li>
        ) : (
          rows.map((row) => (
            <li
              key={row.id}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold">{row.shopName}</p>
                  <p className="text-sm text-slate-600">
                    {row.name} · {row.phone}
                    {row.location ? ` · ${row.location}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {row.status}
                    {row.applicantUid ? ` · uid ${row.applicantUid}` : ""}
                    {row.notes ? ` · ${row.notes}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Btn
                    disabled={busyId === row.id}
                    onClick={() =>
                      run(row.id, () =>
                        updateWaitlistStatus(row.id, {
                          status: WAITLIST_STATUS.CONTACTED,
                          notes: "Marked contacted",
                        })
                      )
                    }
                  >
                    Contacted
                  </Btn>
                  <Btn
                    disabled={busyId === row.id}
                    onClick={() =>
                      run(row.id, async () => {
                        let shopId = "";
                        if (row.applicantUid) {
                          const created = await createShop({
                            shopName: row.shopName,
                            location: row.location || "Pakistan",
                            ownerUid: row.applicantUid,
                          });
                          shopId = created.id;
                          await attachShopMembership(row.applicantUid, shopId);
                        }
                        await updateWaitlistStatus(row.id, {
                          status: WAITLIST_STATUS.APPROVED,
                          notes: shopId
                            ? `Approved; shop ${shopId}`
                            : "Approved (no linked user — create shop manually)",
                          shopId,
                        });
                      })
                    }
                  >
                    Approve
                  </Btn>
                  <Btn
                    danger
                    disabled={busyId === row.id}
                    onClick={() =>
                      run(row.id, () =>
                        updateWaitlistStatus(row.id, {
                          status: WAITLIST_STATUS.REJECTED,
                          notes: "Rejected",
                        })
                      )
                    }
                  >
                    Reject
                  </Btn>
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

function Btn({ children, onClick, disabled, danger }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[
        "rounded-lg border px-3 py-1.5 text-xs font-semibold disabled:opacity-50",
        danger
          ? "border-rose-200 text-rose-700 hover:bg-rose-50"
          : "border-slate-200 text-slate-700 hover:bg-slate-50",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export default AdminWaitlistPage;
