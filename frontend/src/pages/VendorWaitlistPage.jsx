import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import { siteContent } from "../data/inquiryData";
import { canAccessVendorPortal } from "../lib/accessControl";
import { submitWaitlist } from "../services/vendorWaitlistService";

function VendorWaitlistPage() {
  const { user, profile, isAuthenticated } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [shopName, setShopName] = useState("");
  const [location, setLocation] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile?.displayName) setName(profile.displayName);
    if (profile?.phone) setPhone(profile.phone);
  }, [profile]);

  const vendorOk = canAccessVendorPortal({
    uid: user?.uid,
    role: profile?.role,
    shopIds: profile?.shopIds,
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (!isAuthenticated || !user?.uid) {
      setError("Please sign in to join the vendor waitlist.");
      return;
    }
    setSaving(true);
    try {
      await submitWaitlist({
        name,
        phone,
        shopName,
        location,
        applicantUid: user.uid,
      });
      setSubmitted(true);
    } catch (e) {
      setError(e?.message || "Could not save your request. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-slate-900">
      <Header
        brand={siteContent.brand}
        searchLabel={siteContent.header.searchLabel}
        searchValue=""
        onSearchChange={() => {}}
      />
      <main className="mx-auto max-w-lg px-4 py-10 pb-16 md:px-6">
        <Link
          to="/"
          className="mb-6 inline-flex text-sm font-semibold text-[#0F6B36] hover:underline"
        >
          ← Home
        </Link>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <h1 className="text-2xl font-extrabold text-[#111827]">
            Become a vendor
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Join the onboarding waitlist. Our team reviews applications and
            unlocks your shop. If you already have vendor access, open the
            vendor portal instead.
          </p>

          {vendorOk ? (
            <Link
              to="/vendor"
              className="mt-6 inline-flex min-h-[44px] items-center rounded-xl bg-[#0F6B36] px-5 text-sm font-semibold text-white"
            >
              Open vendor portal
            </Link>
          ) : null}

          {!isAuthenticated ? (
            <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <Link to="/login" className="font-semibold underline">
                Sign in
              </Link>{" "}
              to submit the waitlist form.
            </p>
          ) : null}

          {submitted ? (
            <p
              className="mt-6 rounded-xl border border-[#0F6B36]/20 bg-[#f0faf5] px-4 py-3 text-sm font-medium text-[#0F6B36]"
              role="status"
            >
              Thanks — you are on the waitlist. We will review and contact you.
              You can track status updates via support if needed.
            </p>
          ) : (
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <label className="block text-sm font-semibold text-slate-700">
                Your name
                <input
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Phone / WhatsApp
                <input
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                  required
                />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Shop name
                <input
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  required
                />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                City / location
                <input
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </label>
              {error ? (
                <p className="text-sm text-rose-600" role="alert">
                  {error}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={saving || !isAuthenticated}
                className="flex min-h-[48px] w-full items-center justify-center rounded-xl bg-[#0F6B36] text-sm font-bold text-white disabled:opacity-60"
              >
                {saving ? "Submitting…" : "Join waitlist"}
              </button>
            </form>
          )}
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

export default VendorWaitlistPage;
