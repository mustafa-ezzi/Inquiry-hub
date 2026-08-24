import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { siteContent } from "../../data/inquiryData";
import BrandLogo from "../BrandLogo";

const navClass = ({ isActive }) =>
  [
    "rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors sm:text-sm sm:px-3 sm:py-2",
    isActive
      ? "bg-slate-900 text-white"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  ].join(" ");

const bottomClass = ({ isActive }) =>
  [
    "flex min-w-[4.5rem] flex-1 flex-col items-center gap-0.5 px-1 py-2 text-[10px] font-bold uppercase tracking-wide",
    isActive ? "text-[#0F6B36]" : "text-slate-500",
  ].join(" ");

const links = [
  { to: "/admin", end: true, label: "Dashboard", short: "Home" },
  { to: "/admin/waitlist", label: "Waitlist", short: "Wait" },
  { to: "/admin/users", label: "Users", short: "Users" },
  { to: "/admin/shops", label: "Shops", short: "Shops" },
  { to: "/admin/products", label: "Products", short: "Items" },
  { to: "/admin/categories", label: "Categories", short: "Cats" },
  { to: "/admin/inquiries", label: "Inquiries", short: "Inbox" },
  { to: "/admin/reports", label: "Reports", short: "Reports" },
  { to: "/admin/settings", label: "Settings", short: "Set" },
];

function AdminLayout() {
  const { profile, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
          <Link to="/admin" className="flex items-center gap-2">
            <BrandLogo brand={siteContent.brand} showWordmark={false} />
            <span className="text-sm font-extrabold text-slate-900">
              Owner admin
            </span>
          </Link>
          <nav className="hidden flex-1 flex-wrap gap-1 md:flex">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={navClass}>
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2 text-xs text-slate-500">
            <span className="hidden sm:inline truncate max-w-[8rem]">
              {profile?.displayName || "Admin"}
            </span>
            <Link
              to="/"
              className="rounded-lg border border-slate-200 px-2.5 py-1.5 font-semibold text-slate-600 hover:bg-slate-50"
            >
              Site
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
      <main className="mx-auto max-w-6xl px-4 py-6 pb-28 md:pb-16">
        <Outlet />
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur md:hidden"
        style={{
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <div className="flex overflow-x-auto">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={bottomClass}
            >
              {l.short}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}

export default AdminLayout;
