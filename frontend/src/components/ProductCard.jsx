import { memo } from "react";
import { getPrimaryProductImageUrl } from "../lib/productMedia";

function getInitials(str) {
  if (!str) return "??";
  const words = str.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

/** Firestore/API may send `{ value, unit, label }`, an array of those, or a string */
function measurementTextToDisplay(input) {
  if (input == null || input === "") return "";
  if (typeof input === "string") return input.trim();
  if (typeof input === "number") return String(input);
  if (Array.isArray(input)) {
    return input
      .map(measurementTextToDisplay)
      .filter(Boolean)
      .join(", ");
  }
  if (typeof input === "object") {
    const { unit, label, value } = input;
    const v =
      value != null && value !== ""
        ? typeof value === "object"
          ? measurementTextToDisplay(value)
          : String(value).trim()
        : "";
    const u = unit != null && unit !== "" ? String(unit).trim() : "";
    const l = label != null && label !== "" ? String(label).trim() : "";
    return [v, u, l].filter(Boolean).join(" ").trim();
  }
  return "";
}

function ProductCard({
  image_urls,
  imageSrc,
  imageAlt,
  image,
  name,
  price,
  description,
  isQuoteOnly,
  vendorName,
  vendorVerified,
  verifiedLabel,
  inquiryLabel,
  measurements,
  href,
  onClick,
  onInquiry,
  className = "",
}) {
  const imgSrc = getPrimaryProductImageUrl({
    image_urls,
    imageSrc,
    image,
  });
  const hasImage = Boolean(imgSrc);

  const showGetQuote =
    isQuoteOnly ||
    !price ||
    price === "Get Quote" ||
    price === "0" ||
    price === 0;

  const attributeLine =
    measurementTextToDisplay(measurements) ||
    measurementTextToDisplay(description);

  const cardClasses = [
    "group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#0F6B36]/30 hover:shadow-lg",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const handleKeyDown = (event) => {
    if (!onClick) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick(event);
    }
  };

  return (
    <article
      className={cardClasses}
      onKeyDown={!href ? handleKeyDown : undefined}
      role={!href && onClick ? "button" : undefined}
      tabIndex={!href && onClick ? 0 : undefined}
    >
      {/* Clickable top section */}
      <div
        className="flex flex-1 flex-col cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F6B36] focus-visible:ring-offset-2"
        onClick={onClick}
        role={onClick ? "link" : undefined}
        tabIndex={onClick ? 0 : undefined}
      >
        {/* Image */}
        <div className="relative h-36 overflow-hidden bg-slate-100 sm:h-44">
          {hasImage ? (
            <img
              src={imgSrc}
              alt={imageAlt || name}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-100">
              <span className="text-3xl font-bold tracking-wide text-slate-300 sm:text-4xl">
                {getInitials(name)}
              </span>
            </div>
          )}

          {/* Verified badge — top left */}
          {vendorVerified && (
            <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-[#0F6B36] px-2.5 py-1 text-[10px] font-semibold text-white shadow">
              <svg
                width="10"
                height="10"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden="true"
              >
                <circle cx="6" cy="6" r="6" fill="rgba(255,255,255,0.25)" />
                <path
                  d="M3.5 6.2L5.2 7.9L8.5 4.5"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {verifiedLabel || "Verified"}
            </span>
          )}
        </div>

        {/* Card content */}
        <div className="flex flex-1 flex-col gap-2 p-3 md:p-3.5">
          {/* Vendor name pill */}
          {vendorName && (
            <span className="w-fit max-w-full truncate rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-medium text-slate-500">
              {vendorName}
            </span>
          )}

          {/* Product name */}
          <h3 className="line-clamp-2 text-sm font-bold leading-5 text-[#111827] sm:text-[0.875rem] sm:leading-snug">
            {name}
          </h3>

          {/* Attributes / description (backend may send structured objects) */}
          {attributeLine && (
            <div className="flex items-start gap-1.5 text-xs text-slate-500">
              {/* Tag icon */}
              <svg
                width="12"
                height="12"
                viewBox="0 0 16 16"
                fill="none"
                className="mt-px shrink-0 text-slate-400"
                aria-hidden="true"
              >
                <path
                  d="M2 2h5.172a2 2 0 0 1 1.414.586l5.657 5.657a2 2 0 0 1 0 2.828l-3.172 3.172a2 2 0 0 1-2.828 0L2.586 8.586A2 2 0 0 1 2 7.172V2z"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinejoin="round"
                />
                <circle cx="5.5" cy="5.5" r="1" fill="currentColor" />
              </svg>
              <span className="line-clamp-1">{attributeLine}</span>
            </div>
          )}

          {/* Price or Get Quote */}
          <div className="mt-auto pt-1">
            {showGetQuote ? (
              <span className="inline-block rounded-full border border-amber-400 bg-amber-50 px-3 py-0.5 text-xs font-semibold text-amber-600">
                Get Quote
              </span>
            ) : (
              <p className="text-base font-bold text-[#0F6B36]">{price}</p>
            )}
          </div>
        </div>
      </div>

      {/* Send Inquiry button */}
      <div className="px-3 pb-3 md:px-3.5 md:pb-3.5">
        <button
          type="button"
          onClick={onInquiry}
          className="min-h-[40px] w-full rounded-xl bg-[#0F6B36] px-3 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#0d5f30] hover:shadow-md active:scale-[0.98]"
        >
          {inquiryLabel || "Send Inquiry"}
        </button>
      </div>
    </article>
  );
}

export default memo(ProductCard);
