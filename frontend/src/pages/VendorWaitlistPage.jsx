import { useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { siteContent } from "../data/inquiryData";

const STORAGE_KEY = "vendor_waitlist";

function VendorWaitlistPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [shopName, setShopName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");
    if (!name.trim() || !phone.trim() || !shopName.trim()) {
      setError("Please fill in name, phone, and shop name.");
      return;
    }
    try {
      const prev = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      const entry = {
        name: name.trim(),
        phone: phone.trim(),
        shopName: shopName.trim(),
        createdAt: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify([entry, ...prev]));
      setSubmitted(true);
    } catch {
      setError("Could not save your request. Try again.");
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
            Register as Vendor
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Full vendor portal arrives in Phase 4. Join the waitlist and we will
            notify you when onboarding opens.
          </p>

          {submitted ? (
            <p
              className="mt-6 rounded-xl border border-[#0F6B36]/20 bg-[#f0faf5] px-4 py-3 text-sm font-medium text-[#0F6B36]"
              role="status"
            >
              Thanks — you are on the waitlist. You can also create a basic shop
              from the home page today.
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
                />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Phone
                <input
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Shop name
                <input
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                />
              </label>
              {error ? (
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              ) : null}
              <button
                type="submit"
                className="min-h-[44px] w-full rounded-xl bg-[#0F6B36] px-4 py-2.5 text-sm font-semibold text-white"
              >
                Join waitlist
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
