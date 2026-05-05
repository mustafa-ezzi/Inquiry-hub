import { memo } from "react";

function SidebarCategories({
  title,
  description,
  items,
  activeCategoryId,
  onSelectCategory,
}) {
  return (
    <aside className="hidden lg:block lg:w-[23%] lg:min-w-[260px]">
      <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 space-y-1.5">
          <h2 className="text-xl font-semibold text-[#111827]">{title}</h2>
          <p className="text-sm leading-6 text-[#6b7280]">{description}</p>
        </div>

        <nav aria-label={title} className="flex flex-col gap-2">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={activeCategoryId === item.id}
              onClick={() =>
                onSelectCategory(
                  activeCategoryId === item.id ? null : item.id
                )
              }
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
          ))}
        </nav>
      </div>
    </aside>
  );
}

export default memo(SidebarCategories);
