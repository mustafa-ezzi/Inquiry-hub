import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import { siteContent } from "../data/inquiryData";
import { canAccessVendorPortal } from "../lib/accessControl";

function ProfilePage() {
  const { profile, user, logout, saveContact, loading } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDisplayName(profile?.displayName || "");
    setPhone(profile?.phone || "");
  }, [profile]);

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);
    try {
      await saveContact({ displayName, phone });
      setMessage("Profile saved.");
    } catch (err) {
      setError(err?.message || "Could not save profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
        Loading profile…
      </div>
    );
  }

  const vendorOk = canAccessVendorPortal({
    uid: user?.uid,
    role: profile?.role,
    shopIds: profile?.shopIds,
  });

  return (
    <div className="min-h-screen bg-background text-slate-900">
      <Header brand={siteContent.brand} searchLabel={siteContent.header.searchLabel} />
      <main className="mx-auto max-w-lg px-4 py-10 pb-16">
        <Link to="/" className="text-sm font-semibold text-[#0F6B36] hover:underline">
          ← Home
        </Link>
        <h1 className="mt-4 text-2xl font-extrabold">Your profile</h1>
        <p className="mt-1 text-sm text-slate-600">
          Role: <span className="font-semibold capitalize">{profile?.role || "buyer"}</span>
          {user?.email ? ` · ${user.email}` : null}
        </p>

        <form
          onSubmit={handleSave}
          className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <label className="block text-sm font-semibold text-slate-700">
            Display name
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Phone (used for inquiries)
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            />
          </label>
          {message ? (
            <p className="text-sm text-[#0F6B36]" role="status">
              {message}
            </p>
          ) : null}
          {error ? (
            <p className="text-sm text-rose-600" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={saving}
            className="min-h-[44px] w-full rounded-xl bg-[#0F6B36] text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save contact"}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-3">
          <Link
            to="/inquiries"
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#0F6B36]"
          >
            My inquiries
          </Link>
          {vendorOk ? (
            <Link
              to="/vendor"
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#0F6B36]"
            >
              Vendor portal
            </Link>
          ) : (
            <Link
              to="/vendor-waitlist"
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
            >
              Become a vendor
            </Link>
          )}
          <button
            type="button"
            onClick={() => logout()}
            className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
          >
            Sign out
          </button>
        </div>
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

export default ProfilePage;
