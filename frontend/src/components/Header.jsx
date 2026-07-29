import { memo } from "react";
import { Link } from "react-router-dom";
import BrandLogo from "./BrandLogo";
import Container from "./Container";
import InstallPwaButton from "./InstallPwaButton";
import SearchBar from "./SearchBar";

/**
 * Account / Cart header actions are deferred until Auth (Phase 2).
 * Pass `actions` only when they have real handlers.
 */
function Header({ brand, searchLabel, searchValue, onSearchChange }) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-md">
      <Container>
        <div className="flex h-16 items-center gap-4">
          <Link
            to="/"
            className="group flex shrink-0 items-center gap-3 transition-opacity hover:opacity-90"
          >
            <BrandLogo
              brand={brand}
              wordmarkClassName="hidden lg:inline max-w-[10rem] truncate sm:max-w-none"
              className="gap-3 transition-transform group-hover:scale-[1.02]"
            />
          </Link>

          <div className="flex flex-1 items-center justify-center px-2">
            {typeof onSearchChange === "function" ? (
              <SearchBar
                placeholder={searchLabel}
                value={searchValue}
                onChange={onSearchChange}
                compact
                className="max-w-md flex-1 transition-all duration-300 focus-within:max-w-lg"
              />
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <InstallPwaButton />
            <Link
              to="/inquiries"
              className="inline-flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-bold text-[#0F6B36] shadow-sm transition-colors hover:border-[#0F6B36]/30 hover:bg-[#f0faf5] sm:px-3"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="hidden sm:inline">Messages</span>
            </Link>
          </div>
        </div>
      </Container>
    </header>
  );
}

export default memo(Header);
