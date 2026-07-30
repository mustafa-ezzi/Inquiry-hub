import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listOpenReports } from "../../services/moderationService";
import { listShopsForAdmin } from "../../services/shopsService";

function AdminDashboardPage() {
  const [shops, setShops] = useState([]);
  const [reports, setReports] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [shopRows, reportRows] = await Promise.all([
          listShopsForAdmin(),
          listOpenReports(),
        ]);
        if (!cancelled) {
          setShops(shopRows);
          setReports(reportRows);
        }
      } catch (e) {
        if (!cancelled) setError(e?.message || "Could not load admin stats.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const pendingVerify = shops.filter((s) => !s.isVerified && !s.suspended).length;
  const suspended = shops.filter((s) => s.suspended).length;

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Operations dashboard</h1>
      <p className="mt-1 text-sm text-slate-600">
        Verify shops, review reports, and suspend abusive sellers.
      </p>
      {error ? (
        <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {error}
        </p>
      ) : null}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Stat label="Pending verification" value={pendingVerify} />
        <Stat label="Suspended shops" value={suspended} />
        <Stat label="Open reports" value={reports.length} accent />
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          to="/admin/shops"
          className="inline-flex min-h-[44px] items-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white"
        >
          Manage shops
        </Link>
        <Link
          to="/admin/reports"
          className="inline-flex min-h-[44px] items-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-800"
        >
          Review reports
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }) {
  return (
    <div
      className={[
        "rounded-2xl border px-4 py-4",
        accent ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-white",
      ].join(" ")}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-extrabold">{value}</p>
    </div>
  );
}

export default AdminDashboardPage;
