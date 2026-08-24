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

const bottomClass = ({ isActive }) =>
  [
    "flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-bold uppercase tracking-wide",
    isActive ? "text-[#0F6B36]" : "text-slate-500",
  ].join(" ");

function VendorLayout() {
  const { profile, logout } = useAuth();
  const shopId = profile?.shopIds?.[0] || "";

  return (
    <div className="min-h-screen bg-background text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
          <Link to="/vendor" className="flex items-center gap-2">
            <BrandLogo brand={siteContent.brand} showWordmark />
            <span className="hidden text-xs font-bold uppercase tracking-wider text-[#0F6B36] sm:inline">
              Vendor
            </span>
          </Link>
          <nav className="hidden flex-1 flex-wrap gap-1 md:flex">
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
          <div className="ml-auto flex items-center gap-2 text-xs text-slate-500">
            <Link
              to="/profile"
              className="rounded-lg border border-slate-200 px-2.5 py-1.5 font-semibold text-slate-700 hover:bg-[#f0faf5]"
            >
              {profile?.displayName || "Profile"}
            </Link>
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
            <Link to="/vendor/shop" className="font-semibold underline">
              Create your shop here
            </Link>{" "}
            to receive leads.
          </div>
        </div>
      ) : null}

      <main className="mx-auto max-w-6xl px-4 py-6 pb-24 md:pb-16">
        <Outlet context={{ shopId, profile }} />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-lg">
          <NavLink to="/vendor" end className={bottomClass}>
            Home
          </NavLink>
          <NavLink to="/vendor/inbox" className={bottomClass}>
            Inbox
          </NavLink>
          <NavLink to="/vendor/products" className={bottomClass}>
            Products
          </NavLink>
          <NavLink to="/vendor/shop" className={bottomClass}>
            Shop
          </NavLink>
        </div>
      </nav>
    </div>
  );
}

export default VendorLayout;
