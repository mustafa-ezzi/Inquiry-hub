import { Link, useLocation } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useSiteConfig } from "../context/SiteConfigContext";
import { siteContent } from "../data/inquiryData";
import { LEGAL_CONTENT } from "../lib/legalContent";

function LegalPage() {
  const { pathname } = useLocation();
  const { config } = useSiteConfig();
  const page = LEGAL_CONTENT[pathname];

  const title = page?.title || "Page";
  const sections = page?.sections || [
    {
      heading: undefined,
      body: "This page is not available yet. Please return to the home page.",
    },
  ];
  const supportEmail =
    config?.supportEmail || page?.supportEmail || "";
  const supportWhatsApp =
    config?.supportWhatsAppUrl || page?.supportWhatsApp || "";

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
          {page?.lastUpdated ? (
            <p className="mt-2 text-xs text-slate-400">
              Last updated: {page.lastUpdated}
            </p>
          ) : null}
          <div className="mt-6 space-y-6">
            {sections.map((section) => (
              <section key={section.heading || section.body.slice(0, 24)}>
                {section.heading ? (
                  <h2 className="text-sm font-bold uppercase tracking-wide text-slate-800">
                    {section.heading}
                  </h2>
                ) : null}
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {section.body}
                </p>
              </section>
            ))}
          </div>
          {supportEmail || supportWhatsApp ? (
            <div className="mt-8 flex flex-wrap gap-3">
              {supportEmail ? (
                <a
                  href={`mailto:${supportEmail}`}
                  className="inline-flex min-h-[44px] items-center rounded-xl bg-[#0F6B36] px-4 text-sm font-semibold text-white"
                >
                  Email support
                </a>
              ) : null}
              {supportWhatsApp ? (
                <a
                  href={supportWhatsApp}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex min-h-[44px] items-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-800"
                >
                  WhatsApp
                </a>
              ) : null}
            </div>
          ) : null}
          <p className="mt-8 text-xs text-slate-400">
            MVP policy text for Alpha. Counsel review recommended before GA.
            See also our{" "}
            <Link to="/privacy" className="font-semibold text-[#0F6B36] underline">
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link to="/terms" className="font-semibold text-[#0F6B36] underline">
              Terms
            </Link>
            .
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
