import { memo, useMemo, useState } from "react";
import SectionShell from "../components/SectionShell";
import VendorCard from "../components/VendorCard";
import CreateShopModal from "../components/CreateShopModal";

function SkeletonShopCard() {
  return (
    <div className="flex h-full min-h-[200px] w-full animate-pulse flex-col rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex gap-3.5">
        <div className="h-12 w-12 shrink-0 rounded-[14px] bg-slate-200" />
        <div className="flex flex-1 flex-col gap-2 pt-1">
          <div className="h-4 w-3/4 rounded-full bg-slate-200" />
          <div className="h-3 w-1/2 rounded-full bg-slate-100" />
        </div>
      </div>
      <div className="mt-4 h-8 w-24 rounded-full bg-slate-100" />
      <div className="mt-auto pt-8">
        <div className="h-10 w-full rounded-xl bg-slate-200" />
      </div>
    </div>
  );
}

function TopVendorsSection({
  title,
  description,
  items,
  isLoading = false,
  errorMessage = "",
  onShopsRefresh,
}) {
  const [modalOpen, setModalOpen] = useState(false);

  const toolbar = useMemo(
    () => (
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#0F6B36]/35 bg-[#f0faf5] px-5 py-2.5 text-sm font-bold text-[#0F6B36] shadow-sm transition-all hover:border-[#0F6B36]/60 hover:bg-white hover:shadow-md sm:w-auto"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
          <path
            d="M9 4v10M4 9h10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        Create your shop
      </button>
    ),
    []
  );

  return (
    <>
      <SectionShell
        title={title}
        description={description}
        toolbar={toolbar}
      >
        {errorMessage && !isLoading ? (
          <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {errorMessage}
          </div>
        ) : null}

        {isLoading ? (
          <div className="grid gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonShopCard key={i} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm md:py-14">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f0faf5]">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                className="text-[#0F6B36]"
              >
                <path
                  d="M4 21V10M4 10l4-7h8l4 7M4 10h16M10 21v-8h4v8"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3 className="text-base font-bold text-[#111827]">No shops yet</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-[#6b7280]">
              Be the first to list your business. Create your shop — it&apos;s free
              and takes under a minute.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-3">
            {items.map((vendor) => (
              <VendorCard key={vendor.id} {...vendor} />
            ))}
          </div>
        )}
      </SectionShell>

      <CreateShopModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={onShopsRefresh}
      />
    </>
  );
}

export default memo(TopVendorsSection);
