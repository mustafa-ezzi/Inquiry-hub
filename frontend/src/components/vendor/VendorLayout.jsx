import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { siteContent } from "../../data/inquiryData";
import { mapCategoryIcon } from "../../lib/categoryIcons";
import BrandLogo from "../BrandLogo";

const navClass = ({ isActive }) =>
  [
    "rounded-xl px-3 py-2 text-sm font-semibold transition-colors",
    isActive
      ? "bg-[#0F6B36] text-white"
      : "text-slate-600 hover:bg-[#f0faf5] hover:text-[#0F6B36]",
  ].join(" ");

const BOTTOM_ITEMS = [
  { to: "/vendor", end: true, id: "home", label: "Home" },
  { to: "/vendor/inbox", end: false, id: "inquiry", label: "Leads" },
  { to: "/vendor/products", end: false, id: "hammer", label: "Products" },
  { to: "/vendor/shop", end: false, id: "hard-hat", label: "Shop" },
];

function VendorLayout() {
  const { profile, logout } = useAuth();
  const { pathname } = useLocation();
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
              Leads
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

      <main className="mx-auto max-w-6xl px-4 py-6 pb-28 md:pb-16">
        <Outlet context={{ shopId, profile }} />
      </main>

      {/* Mobile bottom nav — always mounted for all /vendor/* routes */}
      <div
        className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-background/95 backdrop-blur md:hidden"
        style={{
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <nav
          aria-label="Vendor"
          className="mx-auto grid max-w-lg grid-cols-4 gap-2 px-3 py-3"
        >
          {BOTTOM_ITEMS.map((item) => {
            const Icon = mapCategoryIcon(item.id);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => {
                  const active =
                    isActive ||
                    (item.to === "/vendor/inbox" &&
                      pathname.startsWith("/vendor/inbox"));
                  return [
                    "flex min-h-[48px] flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-xs font-medium shadow-sm transition-all duration-200",
                    active
                      ? "bg-[#0F6B36] text-white shadow-md"
                      : "bg-white text-[#6b7280] hover:text-[#0F6B36]",
                  ].join(" ");
                }}
              >
                <Icon className="h-4 w-4" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

export default VendorLayout;
