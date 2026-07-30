import { memo } from "react";

function VendorCard({
  shopName,
  location,
  isVerified,
  verifiedLabel,
  repliesQuickly,
  viewShopLabel,
  href,
  onClick,
  onViewShop,
  productCount,
  rating,
  memberSince,
  className = "",
}) {
  const initials = shopName
    ? shopName
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "??";

  const cardClasses = [
    "flex h-full w-full flex-col rounded-2xl bg-white p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg md:p-5",
    isVerified
      ? "border border-[#0F6B36]/30"
      : "border border-slate-200 hover:border-slate-300",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const interactiveClasses =
    "block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F6B36] focus-visible:ring-offset-2";

  const handleKeyDown = (event) => {
    if (!onClick) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick(event);
    }
  };

  const cardBody = (
    <div className="flex flex-col gap-3.5">
      {/* Avatar + name row */}
      <div className="flex items-center gap-3.5">
        <div
          className={[
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] text-base font-bold tracking-tight",
            isVerified
              ? "bg-[#0F6B36] text-white"
              : "bg-slate-100 text-slate-500",
          ].join(" ")}
        >
          {initials}
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold text-[#111827]">
            {shopName}
          </h3>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-[#6b7280]">
            {/* Pin icon */}
            <svg
              width="11"
              height="11"
              viewBox="0 0 12 12"
              fill="none"
              className="shrink-0"
            >
              <path
                d="M6 1a3.5 3.5 0 013.5 3.5c0 2.5-3.5 6.5-3.5 6.5S2.5 7 2.5 4.5A3.5 3.5 0 016 1z"
                stroke="currentColor"
                strokeWidth="1.2"
              />
              <circle cx="6" cy="4.5" r="1.2" fill="currentColor" />
            </svg>
            {location}
          </p>
        </div>
      </div>

      {/* Verified / unverified badge */}
      <div className="flex flex-wrap gap-2">
      {isVerified ? (
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[#0F6B36]/20 bg-[#f0faf5] px-2.5 py-1">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path
              d="M2 5.5L4 7.5L8 3"
              stroke="#0F6B36"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#0F6B36]">
            {verifiedLabel}
          </span>
        </span>
      ) : (
        <span className="inline-flex w-fit items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1">
          <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
            Unverified
          </span>
        </span>
      )}
      {repliesQuickly ? (
        <span className="inline-flex w-fit items-center rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1">
          <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-sky-800">
            Replies quickly
          </span>
        </span>
      ) : null}
      </div>

      {/* Meta chips */}
      {(productCount || rating || memberSince) && (
        <div className="grid grid-cols-3 gap-2">
          {productCount && (
            <div className="flex flex-col gap-0.5 rounded-[10px] border border-[#e9f5ee] bg-[#f7fdf9] px-2.5 py-2">
              <span className="text-sm font-bold text-[#0F6B36]">
                {productCount}
              </span>
              <span className="text-[10px] text-[#6b7280]">Products</span>
            </div>
          )}
          {rating && (
            <div className="flex flex-col gap-0.5 rounded-[10px] border border-[#e9f5ee] bg-[#f7fdf9] px-2.5 py-2">
              <span className="text-sm font-bold text-[#0F6B36]">
                {rating}★
              </span>
              <span className="text-[10px] text-[#6b7280]">Rating</span>
            </div>
          )}
          {memberSince && (
            <div className="flex flex-col gap-0.5 rounded-[10px] border border-[#e9f5ee] bg-[#f7fdf9] px-2.5 py-2">
              <span className="text-sm font-bold text-[#0F6B36]">
                {memberSince}
              </span>
              <span className="text-[10px] text-[#6b7280]">Member</span>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const ActionableArea = href ? "a" : onClick ? "button" : "div";
  const actionableProps = href
    ? { href }
    : onClick
      ? { type: "button", onClick }
      : {};

  return (
    <article
      className={cardClasses}
      onKeyDown={!href ? handleKeyDown : undefined}
      role={!href && onClick ? "button" : undefined}
      tabIndex={!href && onClick ? 0 : undefined}
    >
      <ActionableArea className={interactiveClasses} {...actionableProps}>
        {cardBody}
      </ActionableArea>

      <div className="mt-auto pt-4">
        <div className="border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onViewShop}
            className="min-h-[42px] w-full rounded-xl bg-[#0F6B36] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#0d5f30] hover:shadow-md active:scale-[0.98]"
          >
            {viewShopLabel}
          </button>
        </div>
      </div>
    </article>
  );
}

export default memo(VendorCard);