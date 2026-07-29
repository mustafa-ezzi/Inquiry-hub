import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { siteContent } from "../../data/inquiryData";
import BrandLogo from "../BrandLogo";

const navClass = ({ isActive }) =>
  [
    "rounded-xl px-3 py-2 text-sm font-semibold transition-colors",
    isActive
      ? "bg-[#0F6B36] text-white"
      : "text-slate-600 hover:bg-[#f0faf5] hover:text-[#0F6B36]",
  ].join(" ");

function VendorLayout() {
  const { profile, logout } = useAuth();
  const shopId = profile?.shopIds?.[0] || "";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
          <Link to="/vendor" className="flex items-center gap-2">
            <BrandLogo brand={siteContent.brand} showWordmark={false} />
            <span className="text-sm font-extrabold text-[#111827]">
              Vendor
            </span>
          </Link>
          <nav className="flex flex-1 flex-wrap gap-1">
            <NavLink to="/vendor" end className={navClass}>
              Dashboard
            </NavLink>
            <NavLink to="/vendor/inbox" className={navClass}>
              Inbox
            </NavLink>
            <NavLink to="/vendor/products" className={navClass}>
              Products
            </NavLink>
            <NavLink to="/vendor/shop" className={navClass}>
              Shop
            </NavLink>
          </nav>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="hidden sm:inline truncate max-w-[8rem]">
              {profile?.displayName}
            </span>
            <Link
              to="/"
              className="rounded-lg border border-slate-200 px-2.5 py-1.5 font-semibold text-slate-600 hover:bg-slate-50"
            >
              Buyer site
            </Link>
            <button
              type="button"
              onClick={() => logout()}
              className="rounded-lg border border-rose-200 px-2.5 py-1.5 font-semibold text-rose-700 hover:bg-rose-50"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {!shopId ? (
        <div className="mx-auto max-w-6xl px-4 pt-4">
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            No shop linked yet.{" "}
            <Link to="/" className="font-semibold underline">
              Create a shop on the home page
            </Link>{" "}
            to receive leads.
          </div>
        </div>
      ) : null}

      <main className="mx-auto max-w-6xl px-4 py-6 pb-16">
        <Outlet context={{ shopId, profile }} />
      </main>
    </div>
  );
}

export default VendorLayout;
