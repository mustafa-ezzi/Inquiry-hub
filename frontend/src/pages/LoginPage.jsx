import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import GoogleSignInButton from "../components/GoogleSignInButton";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import { siteContent } from "../data/inquiryData";
import { authErrorMessage } from "../services/authService";

function LoginPage() {
  const { login, loginWithGoogle, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loading && isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const finish = (path = from) => navigate(path, { replace: true });

  const handleGoogle = async () => {
    setError("");
    setSubmitting(true);
    try {
      await loginWithGoogle();
      finish();
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      finish();
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-slate-900">
      <Header brand={siteContent.brand} searchLabel={siteContent.header.searchLabel} />
      <main className="mx-auto max-w-md px-4 py-10">
        <h1 className="text-2xl font-extrabold text-[#111827]">Sign in</h1>
        <p className="mt-2 text-sm text-slate-600">
          Continue with Google (shown as <strong>Mart-Hub</strong> on the consent
          screen), or use email if Email/Password is also enabled.
        </p>

        <div className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <GoogleSignInButton
            onClick={handleGoogle}
            disabled={submitting}
            label={submitting ? "Opening Google…" : "Continue with Google"}
          />

          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            or email
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-sm font-semibold text-slate-700">
              Email
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Password
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              />
            </label>
            {error ? (
              <p className="text-sm text-rose-600" role="alert">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={submitting}
              className="min-h-[44px] w-full rounded-xl bg-[#0F6B36] text-sm font-semibold text-white disabled:opacity-60"
            >
              {submitting ? "Signing in…" : "Sign in with email"}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-slate-600">
          No account?{" "}
          <Link to="/register" className="font-semibold text-[#0F6B36] hover:underline">
            Create one
          </Link>
        </p>
      </main>
      <Footer
        brand={siteContent.brand}
        sections={siteContent.footer.sections}
        socialLinks={siteContent.footer.socialLinks}
        note={siteContent.footer.note}
      />
    </div>
  );
}

export default LoginPage;
