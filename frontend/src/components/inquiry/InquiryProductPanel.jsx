import { memo } from "react";

function RulerIcon({ className }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M2 2h12v12H2V2z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path
        d="M5 2v2M8 2v1M11 2v2M5 8v2M8 8v1M11 8v2"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function InquiryProductPanel({
  view,
  name,
  imageUrl,
  specLine,
  isQuoteOnly,
  priceLabel,
  vendorName,
  location,
  verified,
  hasInquiry,
}) {
  const isStrip = view === "strip";

  const imageBlock = (
    <div
      className={[
        "relative shrink-0 overflow-hidden rounded-2xl bg-slate-100",
        isStrip ? "h-14 w-14" : "aspect-square w-full",
      ].join(" ")}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-slate-300">
          {(name || "?").slice(0, 2).toUpperCase()}
        </div>
      )}
      {verified && (
        <span className="absolute left-1 top-1 flex items-center gap-0.5 rounded-full bg-[#0F6B36] px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-white shadow">
          ✓
        </span>
      )}
    </div>
  );

  if (isStrip) {
    return (
      <div className="flex flex-row items-center gap-3 border-b border-slate-200 bg-white px-4 py-2.5 shadow-sm lg:hidden">
        {imageBlock}
        <div className="min-w-0 flex-1">
          <h2 className="line-clamp-1 text-sm font-bold text-[#111827]">{name}</h2>
          {specLine ? (
            <div className="mt-0.5 flex items-center gap-1 text-[11px] text-[#6b7280]">
              <RulerIcon className="shrink-0 text-slate-400" />
              <span className="truncate">{specLine}</span>
            </div>
          ) : null}
        </div>
        <div className="shrink-0 text-right">
          {isQuoteOnly ? (
            <span className="inline-block rounded-full border border-amber-400 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
              Quote
            </span>
          ) : (
            <p className="max-w-[5.5rem] truncate text-xs font-bold text-[#0F6B36]">
              {priceLabel}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <aside className="hidden h-full w-[min(100%,320px)] shrink-0 flex-col border-r border-slate-200 bg-white p-5 lg:flex">
      {imageBlock}
      <div className="mt-4 space-y-3">
        {verified ? (
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#0F6B36]">
            Verified product
          </p>
        ) : null}
        <h2 className="text-base font-bold leading-snug text-[#111827]">{name}</h2>
        {specLine ? (
          <div className="flex items-start gap-1.5 text-xs text-[#6b7280]">
            <RulerIcon className="mt-0.5 shrink-0 text-slate-400" />
            <span className="line-clamp-3">{specLine}</span>
          </div>
        ) : null}
        <div>
          {isQuoteOnly ? (
            <span className="inline-block rounded-full border border-amber-400 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
              Get Quote
            </span>
          ) : (
            <p className="text-sm font-bold text-[#0F6B36]">{priceLabel}</p>
          )}
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5 text-xs">
          <p className="font-semibold text-[#111827]">{vendorName}</p>
          <p className="mt-0.5 text-[#6b7280]">{location}</p>
        </div>
        {hasInquiry && (
          <div className="rounded-xl border border-[#0F6B36]/25 bg-[#f0faf5] px-3 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#0F6B36]">
              Active inquiry
            </p>
            <p className="mt-1 text-xs text-[#374151]">
              Your conversation is open. Send messages below — the vendor will
              reply here.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}

export default memo(InquiryProductPanel);
