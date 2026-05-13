import { memo } from "react";

function InquiryChatHeader({ vendorName, location, onBack }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-container items-center gap-3 px-4 py-3 md:px-8">
        <button
          type="button"
          onClick={onBack}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-[#111827] shadow-sm transition-colors hover:border-[#0F6B36]/30 hover:bg-[#f0faf5] hover:text-[#0F6B36]"
          aria-label="Back"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M11 14L6 9L11 4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-bold text-[#111827] md:text-base">
            {vendorName}
          </h1>
          <p className="truncate text-xs text-[#6b7280]">{location}</p>
        </div>
      </div>
    </header>
  );
}

export default memo(InquiryChatHeader);
