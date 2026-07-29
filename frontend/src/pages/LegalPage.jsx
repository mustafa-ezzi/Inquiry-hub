import { Link, useLocation } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { siteContent } from "../data/inquiryData";
import { LEGAL_PAGES } from "../lib/footerLinks";

const byPath = Object.fromEntries(LEGAL_PAGES.map((p) => [p.path, p]));

function LegalPage() {
  const { pathname } = useLocation();
  const page = byPath[pathname];

  const title = page?.title || "Page";
  const summary =
    page?.summary ||
    "This page is not available yet. Please return to the home page.";

  return (
    <div className="min-h-screen bg-background text-slate-900">
      <Header
        brand={siteContent.brand}
        searchLabel={siteContent.header.searchLabel}
      />
      <main className="mx-auto max-w-3xl px-4 py-10 pb-16 md:px-6">
        <Link
          to="/"
          className="mb-6 inline-flex text-sm font-semibold text-[#0F6B36] hover:underline"
        >
          ← Home
        </Link>
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <h1 className="text-2xl font-extrabold text-[#111827]">{title}</h1>
          <p className="mt-4 text-sm leading-7 text-slate-600">{summary}</p>
          <p className="mt-6 text-xs text-slate-400">
            Placeholder content for Phase 1. Legal review planned for Phase 6.
          </p>
        </article>
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

export default LegalPage;
