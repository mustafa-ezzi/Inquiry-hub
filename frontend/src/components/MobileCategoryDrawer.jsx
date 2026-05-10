import { memo, useState } from "react";

function MobileCategoryDrawer({
  title,
  description,
  items,
  activeCategoryId,
  onSelectCategory,
  onOpenChange,
  isLoading = false,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
    onOpenChange?.(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    onOpenChange?.(false);
  };

  const handleSelect = (categoryId) => {
    onSelectCategory(activeCategoryId === categoryId ? null : categoryId);
    handleClose();
  };

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={handleOpen}
        className="min-h-[44px] rounded-2xl border border-secondary bg-white px-4 py-3 text-sm font-semibold text-secondary shadow-sm transition-all duration-200 hover:bg-secondary/5 hover:shadow-md"
      >
        Browse Categories
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 bg-[#111827]/40">
          <div className="h-full w-[86%] max-w-[320px] bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-[#111827]">{title}</h2>
                <p className="text-xs leading-5 text-[#6b7280]">{description}</p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-background text-[#111827] shadow-sm transition-all duration-200 hover:border-secondary/20 hover:bg-secondary/5 hover:shadow-md"
              >
                X
              </button>
            </div>

            <div className="max-h-[calc(100vh-80px)] overflow-y-auto px-4 py-4">
              <div className="flex flex-col gap-2">
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex min-h-[44px] animate-pulse items-center gap-3 rounded-2xl bg-slate-100 px-4 py-3"
                    >
                      <div className="h-9 w-9 shrink-0 rounded-2xl bg-slate-200" />
                      <div className="h-4 flex-1 rounded-full bg-slate-200" />
                    </div>
                  ))
                ) : items.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-[#6b7280]">
                    No categories in Firestore yet.
                  </p>
                ) : (
                  items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={activeCategoryId === item.id}
                      onClick={() => handleSelect(item.id)}
                      className={[
                        "flex min-h-[44px] items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition-all duration-200",
                        activeCategoryId === item.id
                          ? "bg-secondary text-white shadow-sm"
                          : "bg-white text-[#111827] hover:bg-secondary/5 hover:text-secondary hover:shadow-sm",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "flex h-9 w-9 items-center justify-center rounded-2xl transition-all duration-200",
                          activeCategoryId === item.id
                            ? "bg-white/15 text-white"
                            : "bg-secondary/10 text-secondary",
                        ].join(" ")}
                      >
                        <item.icon className="h-4 w-4" />
                      </span>
                      <span className="truncate">{item.name}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default memo(MobileCategoryDrawer);
