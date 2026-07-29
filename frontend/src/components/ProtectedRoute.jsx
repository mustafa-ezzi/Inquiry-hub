import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { hasAnyRole } from "../lib/roles";

function AuthLoading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#0F6B36] border-t-transparent" />
        <p className="text-sm text-slate-500">Checking session…</p>
      </div>
    </div>
  );
}

/**
 * Requires a signed-in user. Optionally requires one of `roles`.
 */
export function ProtectedRoute({ children, roles }) {
  const { loading, isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (loading) return <AuthLoading />;

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  if (roles?.length && !hasAnyRole(role, roles)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
