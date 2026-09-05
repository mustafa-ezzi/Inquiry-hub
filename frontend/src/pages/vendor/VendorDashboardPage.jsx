import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { summarizeVendorLeads } from "../../lib/vendorInbox";
import { subscribeShopInquiries } from "../../services/inquiryFirestoreService";
import { listVendorProducts } from "../../services/vendorProductService";
import { requestInquiryNotifyPermission } from "../../services/notifyInquiry";

function VendorDashboardPage() {
  const { shopId } = useOutletContext();
  const [leads, setLeads] = useState([]);
  const [productCount, setProductCount] = useState(0);
  const [notifyStatus, setNotifyStatus] = useState("");

  useEffect(() => {
    if (!shopId) {
      setLeads([]);
      return undefined;
    }
    return subscribeShopInquiries(shopId, setLeads);
  }, [shopId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!shopId) {
        setProductCount(0);
        return;
      }
      try {
        const products = await listVendorProducts(shopId);
        if (!cancelled) setProductCount(products.length);
      } catch {
        if (!cancelled) setProductCount(0);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [shopId]);

  const summary = summarizeVendorLeads(leads);

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-slate-900">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-600">
        Lead counts and catalog at a glance. Fast responders earn a “Replies
        quickly” badge automatically.
      </p>

      {!shopId ? (
        <p className="mt-8 text-sm text-slate-500">Link a shop to see metrics.</p>
      ) : (
        <>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Open leads" value={summary.open} />
            <Stat label="Awaiting your reply" value={summary.awaitingVendor} accent />
            <Stat label="Closed / other" value={summary.closed} />
            <Stat label="Active products" value={productCount} />
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/vendor/inbox"
              className="inline-flex min-h-[44px] items-center rounded-xl bg-[#0F6B36] px-5 text-sm font-semibold text-white hover:bg-[#0d5f30]"
            >
              Open leads
            </Link>
            <Link
              to="/vendor/products"
              className="inline-flex min-h-[44px] items-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Manage products
            </Link>
            <button
              type="button"
              onClick={async () => {
                const status = await requestInquiryNotifyPermission();
                setNotifyStatus(status);
              }}
              className="inline-flex min-h-[44px] items-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Enable browser alerts
            </button>
          </div>
          {notifyStatus ? (
            <p className="mt-2 text-xs text-slate-500">
              Notification permission: {notifyStatus}
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}

function Stat({ label, value, accent }) {
  return (
    <div
      className={[
        "rounded-2xl border px-4 py-4",
        accent
          ? "border-amber-200 bg-amber-50"
          : "border-slate-200 bg-white",
      ].join(" ")}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-extrabold text-slate-900">{value}</p>
    </div>
  );
}

export default VendorDashboardPage;
