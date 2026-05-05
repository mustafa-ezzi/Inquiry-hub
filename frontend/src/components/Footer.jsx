import { memo } from "react";
import Container from "./Container";
import PlaceholderIcon from "./PlaceholderIcon";

// Brand Green: #0F6B36
// Brand White: #FFFFFF

function Footer({ brand, sections, socialLinks, note }) {
  return (
    <footer className="bg-slate-50 pb-12 pt-10 md:pb-16 md:pt-20">
      <Container>
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50 md:p-12">
          <div className="grid gap-12 lg:grid-cols-12">
            
            {/* Brand Section */}
            <div className="space-y-6 lg:col-span-4">
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0F6B36] text-sm font-bold text-white shadow-lg shadow-[#0F6B36]/20">
                  {brand.shortName}
                </span>
                <div>
                  <p className="text-lg font-bold tracking-tight text-slate-900">
                    {brand.name}
                  </p>
                  <p className="text-sm leading-relaxed text-slate-500">
                    {note}
                  </p>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex gap-3">
                {socialLinks.map((item, index) => (
                  <button
                    key={`${item}-${index}`}
                    type="button"
                    aria-label={`Visit our ${item} profile`}
                    className="group flex h-11 w-11 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-slate-500 transition-all duration-300 hover:border-[#0F6B36]/30 hover:bg-[#0F6B36] hover:text-white hover:shadow-lg hover:shadow-[#0F6B36]/20"
                  >
                    <PlaceholderIcon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation Sections */}
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-8">
              {sections.map((section) => (
                <div key={section.id} className="space-y-5">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                    {section.title}
                  </h3>
                  <ul className="space-y-3">
                    {section.links.map((link, index) => (
                      <li key={`${link}-${index}`}>
                        <a
                          href="#"
                          className="group relative inline-block text-sm text-slate-600 transition-colors duration-200 hover:text-[#0F6B36]"
                        >
                          {link}
                          <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-[#0F6B36] transition-all duration-300 group-hover:w-full" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 border-t border-slate-100 pt-8 text-center md:flex md:items-center md:justify-between md:text-left">
            <p className="text-xs text-slate-400">
              © {new Date().getFullYear()} {brand.name}. All rights reserved.
            </p>
            <div className="mt-4 flex justify-center gap-6 md:mt-0">
              <a href="#" className="text-xs text-slate-400 hover:text-[#0F6B36]">Privacy Policy</a>
              <a href="#" className="text-xs text-slate-400 hover:text-[#0F6B36]">Terms of Service</a>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}

export default memo(Footer);