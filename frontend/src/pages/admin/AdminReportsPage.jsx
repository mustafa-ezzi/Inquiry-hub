import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  listOpenReports,
  REPORT_TARGET,
  resolveReport,
  setInquiryHidden,
  setProductHidden,
} from "../../services/moderationService";

function AdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setReports(await listOpenReports());
    } catch (e) {
      setError(e?.message || "Could not load reports.");
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, []);

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
      <h1 className="text-2xl font-extrabold">Reports</h1>
      <p className="mt-1 text-sm text-slate-600">
        Review abuse reports. Hide the target and resolve when handled.
      </p>
      {error ? (
        <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {error}
        </p>
      ) : null}
      <ul className="mt-6 space-y-3">
        {loading ? (
          <li className="text-sm text-slate-500">Loading…</li>
        ) : reports.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
            No open reports.
          </li>
        ) : (
          reports.map((r) => (
            <li
              key={r.id}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
            >
              <p className="font-bold capitalize">
                {r.targetType} · {r.targetId}
              </p>
              <p className="mt-1 text-sm text-slate-700">{r.reason}</p>
              {r.details ? (
                <p className="mt-1 text-xs text-slate-500">{r.details}</p>
              ) : null}
              <p className="mt-1 text-xs text-slate-400">
                Reporter: {r.reporterUid}
                {r.targetType === REPORT_TARGET.PRODUCT ? (
                  <>
                    {" · "}
                    <Link
                      to={`/product/${encodeURIComponent(r.targetId)}`}
                      className="font-semibold text-[#0F6B36] hover:underline"
                    >
                      View product
                    </Link>
                  </>
                ) : null}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {r.targetType === REPORT_TARGET.PRODUCT ? (
                  <button
                    type="button"
                    disabled={busyId === r.id}
                    className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                    onClick={() =>
                      run(r.id, async () => {
                        await setProductHidden(r.targetId, true);
                        await resolveReport(r.id, {
                          resolution: "Product hidden",
                        });
                      })
                    }
                  >
                    Hide product & resolve
                  </button>
                ) : null}
                {r.targetType === REPORT_TARGET.INQUIRY ? (
                  <button
                    type="button"
                    disabled={busyId === r.id}
                    className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                    onClick={() =>
                      run(r.id, async () => {
                        await setInquiryHidden(r.targetId, true);
                        await resolveReport(r.id, {
                          resolution: "Inquiry hidden",
                        });
                      })
                    }
                  >
                    Hide inquiry & resolve
                  </button>
                ) : null}
                <button
                  type="button"
                  disabled={busyId === r.id}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  onClick={() =>
                    run(r.id, () =>
                      resolveReport(r.id, { resolution: "Dismissed" })
                    )
                  }
                >
                  Resolve only
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default AdminReportsPage;
