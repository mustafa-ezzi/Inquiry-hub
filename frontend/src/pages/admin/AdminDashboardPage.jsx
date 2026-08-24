import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listOpenReports } from "../../services/moderationService";
import { listShopsForAdmin } from "../../services/shopsService";
import { countPendingWaitlist } from "../../services/vendorWaitlistService";

function AdminDashboardPage() {
  const [shops, setShops] = useState([]);
  const [reports, setReports] = useState([]);
  const [pendingWaitlist, setPendingWaitlist] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [shopRows, reportRows, waitCount] = await Promise.all([
          listShopsForAdmin(),
          listOpenReports(),
          countPendingWaitlist().catch(() => 0),
        ]);
        if (!cancelled) {
          setShops(shopRows);
          setReports(reportRows);
          setPendingWaitlist(waitCount);
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
      <h1 className="text-2xl font-extrabold">Owner dashboard</h1>
      <p className="mt-1 text-sm text-slate-600">
        Manage waitlist, users, catalog, shops, and moderation.
      </p>
      {error ? (
        <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {error}
        </p>
      ) : null}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Waitlist pending" value={pendingWaitlist} accent />
        <Stat label="Pending verification" value={pendingVerify} />
        <Stat label="Suspended shops" value={suspended} />
        <Stat label="Open reports" value={reports.length} />
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Quick to="/admin/waitlist" label="Vendor waitlist" />
        <Quick to="/admin/users" label="Users" />
        <Quick to="/admin/shops" label="Shops" />
        <Quick to="/admin/products" label="Products" />
        <Quick to="/admin/categories" label="Categories" />
        <Quick to="/admin/inquiries" label="Inquiries" />
        <Quick to="/admin/reports" label="Reports" />
        <Quick to="/admin/settings" label="Site settings" />
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

function Quick({ to, label }) {
  return (
    <Link
      to={to}
      className="inline-flex min-h-[40px] items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50"
    >
      {label}
    </Link>
  );
}

export default AdminDashboardPage;
