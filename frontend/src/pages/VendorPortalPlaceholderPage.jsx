import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { siteContent } from "../data/inquiryData";

/** Phase 4 will replace this with inbox + catalog. Route is role-gated now. */
function VendorPortalPlaceholderPage() {
  return (
    <div className="min-h-screen bg-background text-slate-900">
      <Header brand={siteContent.brand} searchLabel={siteContent.header.searchLabel} />
      <main className="mx-auto max-w-lg px-4 py-10">
        <Link to="/" className="text-sm font-semibold text-[#0F6B36] hover:underline">
          ← Home
        </Link>
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-extrabold">Vendor portal</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            You have vendor access. The full lead inbox and catalog tools ship in
            Phase 4. For now you can create a shop from the home page and manage
            your profile.
          </p>
          <Link
            to="/profile"
            className="mt-6 inline-flex min-h-[44px] items-center rounded-xl bg-[#0F6B36] px-5 text-sm font-semibold text-white"
          >
            Open profile
          </Link>
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

export default VendorPortalPlaceholderPage;
