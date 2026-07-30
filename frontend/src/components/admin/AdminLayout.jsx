import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { siteContent } from "../../data/inquiryData";
import BrandLogo from "../BrandLogo";

const navClass = ({ isActive }) =>
  [
    "rounded-xl px-3 py-2 text-sm font-semibold transition-colors",
    isActive
      ? "bg-slate-900 text-white"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  ].join(" ");

function AdminLayout() {
  const { profile, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
          <Link to="/admin" className="flex items-center gap-2">
            <BrandLogo brand={siteContent.brand} showWordmark={false} />
            <span className="text-sm font-extrabold text-slate-900">Admin</span>
          </Link>
          <nav className="flex flex-1 flex-wrap gap-1">
            <NavLink to="/admin" end className={navClass}>
              Dashboard
            </NavLink>
            <NavLink to="/admin/shops" className={navClass}>
              Shops
            </NavLink>
            <NavLink to="/admin/reports" className={navClass}>
              Reports
            </NavLink>
          </nav>
          <div className="flex items-center gap-2 text-xs text-slate-500">
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
      <main className="mx-auto max-w-6xl px-4 py-6 pb-16">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
