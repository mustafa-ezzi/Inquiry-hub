import { memo } from "react";
import BrandLogo from "./BrandLogo";
import Container from "./Container";
import PlaceholderIcon from "./PlaceholderIcon";
import SearchBar from "./SearchBar";

// Brand Green: #0F6B36
// Brand White: #FFFFFF

function Header({ brand, searchLabel, actions, searchValue, onSearchChange }) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-md">
      <Container>
        <div className="flex h-16 items-center gap-4">
          
          {/* Logo Section */}
          <a
            href="#top"
            className="group flex shrink-0 items-center gap-3 transition-opacity hover:opacity-90"
          >
            <BrandLogo
              brand={brand}
              wordmarkClassName="hidden lg:inline max-w-[10rem] truncate sm:max-w-none"
              className="gap-3 transition-transform group-hover:scale-[1.02]"
            />
          </a>

          {/* Search Section */}
          <div className="flex flex-1 items-center justify-center px-2">
            <SearchBar
              placeholder={searchLabel}
              value={searchValue}
              onChange={onSearchChange}
              compact
              // Passing custom classes to SearchBar if supported, 
              // focusing on a clean, centered look.
              className="max-w-md flex-1 transition-all duration-300 focus-within:max-w-lg"
            />
          </div>

          {/* Actions Section */}
          <div className="flex shrink-0 items-center gap-2">
            {actions.map((action) => (
              <button
                key={action.id}
                type="button"
                aria-label={action.label}
                className="group flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-all duration-300 hover:border-[#0F6B36]/30 hover:bg-[#0F6B36]/5 hover:text-[#0F6B36] hover:shadow-sm active:scale-95"
              >
                <PlaceholderIcon className="h-5 w-5 transition-transform duration-300 group-hover:rotate-3" />
              </button>
            ))}
            
            {/* Optional: User Avatar or Profile Placeholder */}
            <div className="ml-1 h-8 w-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
               <div className="h-full w-full bg-gradient-to-br from-slate-200 to-slate-300" />
            </div>
          </div>

        </div>
      </Container>
    </header>
  );
}

export default memo(Header);