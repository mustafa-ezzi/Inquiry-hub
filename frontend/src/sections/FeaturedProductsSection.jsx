import { useState, useMemo } from "react";
import ProductGrid from "../components/ProductGrid";
import SectionShell from "../components/SectionShell";

const PRODUCTS_PER_PAGE = 20;

/* ── Skeleton card ─────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="h-36 animate-pulse bg-slate-200 sm:h-44" />
      <div className="flex flex-1 flex-col gap-2.5 p-3 md:p-3.5">
        <div className="space-y-1.5">
          <div className="h-3.5 w-full animate-pulse rounded-full bg-slate-200" />
          <div className="h-3.5 w-4/5 animate-pulse rounded-full bg-slate-200" />
        </div>
        <div className="h-4 w-2/5 animate-pulse rounded-full bg-slate-200" />
        <div className="mt-auto space-y-1.5 border-t border-slate-100 pt-2">
          <div className="h-3 w-3/5 animate-pulse rounded-full bg-slate-200" />
          <div className="h-3 w-2/5 animate-pulse rounded-full bg-slate-200" />
        </div>
      </div>
      <div className="px-3 pb-3 md:px-3.5 md:pb-3.5">
        <div className="h-10 w-full animate-pulse rounded-xl bg-slate-200" />
      </div>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-3.5 md:grid-cols-4 md:gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/* ── Pagination ────────────────────────────────────────────── */
function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = useMemo(() => {
    const range = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        range.push(i);
      }
    }
    const withEllipsis = [];
    let prev = null;
    for (const i of range) {
      if (prev && i - prev > 1) withEllipsis.push("...");
      withEllipsis.push(i);
      prev = i;
    }
    return withEllipsis;
  }, [currentPage, totalPages]);

  const base =
    "inline-flex h-9 min-w-[36px] items-center justify-center rounded-xl border px-2.5 text-sm font-semibold transition-all duration-150";

  return (
    <div className="flex items-center justify-center gap-1.5">
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Previous page"
        className={[
          base,
          currentPage === 1
            ? "cursor-not-allowed border-slate-200 bg-white text-slate-300"
            : "border-slate-200 bg-white text-[#0F6B36] hover:border-[#0F6B36]/40 hover:bg-[#f0faf5]",
        ].join(" ")}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M9 11L5 7L9 3"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {pages.map((p, idx) =>
        p === "..." ? (
          <span
            key={`e-${idx}`}
            className="inline-flex h-9 w-9 items-center justify-center text-sm text-slate-400"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            aria-current={p === currentPage ? "page" : undefined}
            className={[
              base,
              p === currentPage
                ? "border-[#0F6B36] bg-[#0F6B36] text-white shadow-sm"
                : "border-slate-200 bg-white text-[#374151] hover:border-[#0F6B36]/40 hover:bg-[#f0faf5] hover:text-[#0F6B36]",
            ].join(" ")}
          >
            {p}
          </button>
        )
      )}

      <button
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Next page"
        className={[
          base,
          currentPage === totalPages
            ? "cursor-not-allowed border-slate-200 bg-white text-slate-300"
            : "border-slate-200 bg-white text-[#0F6B36] hover:border-[#0F6B36]/40 hover:bg-[#f0faf5]",
        ].join(" ")}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M5 3L9 7L5 11"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}

/* ── Main section ──────────────────────────────────────────── */
function FeaturedProductsSection({
  title,
  description,
  items,
  emptyStateTitle,
  emptyStateDescription,
  isLoading = false,
  errorMessage = "",
  filterBar,
  onInquiry,
  hasMore,
  loaderRef,
  isFetchingMore,
}) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil((items?.length ?? 0) / PRODUCTS_PER_PAGE);

  const paginatedItems = useMemo(() => {
    if (!items?.length) return [];
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;

    return items.slice(start, start + PRODUCTS_PER_PAGE);
  }, [items, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <SectionShell
      title={title}
      description={description}
      className="py-6 md:py-8"
    >
      {filterBar ? <div className="mb-3 md:mb-4">{filterBar}</div> : null}

      {/* ── Loading skeleton ── */}
      {isLoading ? (
        <SkeletonGrid />
      ) : items.length > 0 ? (
        <div className="space-y-4">
          {/* Partial error warning */}
          {errorMessage && (
            <div className="flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-sm text-amber-700">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="mt-0.5 shrink-0"
              >
                <path
                  d="M8 1.5L14.5 13H1.5L8 1.5Z"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinejoin="round"
                />
                <path
                  d="M8 6v3M8 11v.5"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
              {errorMessage}
            </div>
          )}

          {/* Grid — lazy images handled inside ProductCard via loading="lazy" */}
          <ProductGrid items={items} onInquiry={onInquiry} />
          {hasMore && (
            <div
              ref={loaderRef}
              className="flex items-center justify-center py-6"
            >
              {isFetchingMore ? (
                <p className="text-sm text-slate-400">Loading more products...</p>
              ) : (
                <p className="text-sm text-slate-300">Scroll to load more</p>
              )}
            </div>
          )}
          {/* Pagination footer
          {totalPages > 1 && (
            <div className="flex flex-col items-center gap-2.5 pt-1">
              <p className="text-xs text-slate-400">
                Showing{" "}
                <span className="font-semibold text-[#111827]">
                  {(currentPage - 1) * PRODUCTS_PER_PAGE + 1}–
                  {Math.min(currentPage * PRODUCTS_PER_PAGE, items.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-[#111827]">
                  {items.length}
                </span>{" "}
                products
              </p>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )} */}
        </div>
      ) : errorMessage ? (
        /* ── Full error state ── */
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-center shadow-sm md:p-6">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="7.5" stroke="#e11d48" strokeWidth="1.4" />
              <path
                d="M9 5.5v4M9 11.5v.5"
                stroke="#e11d48"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-rose-700">
            Unable to load products
          </h3>
          <p className="mt-1.5 text-sm text-rose-600">{errorMessage}</p>
        </div>
      ) : (
        /* ── Empty state ── */
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm md:p-6">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0faf5]">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect
                x="2"
                y="2"
                width="14"
                height="14"
                rx="3"
                stroke="#0F6B36"
                strokeWidth="1.4"
              />
              <path
                d="M6 9h6M9 6v6"
                stroke="#0F6B36"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-[#111827]">{emptyStateTitle}</h3>
          <p className="mt-1.5 text-sm text-[#6b7280]">{emptyStateDescription}</p>
        </div>
      )}
    </SectionShell>
  );
}

export default FeaturedProductsSection;