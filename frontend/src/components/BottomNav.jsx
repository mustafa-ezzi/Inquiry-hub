import { memo } from "react";
import Container from "./Container";
import PlaceholderIcon from "./PlaceholderIcon";

function BottomNav({ items, activeItemId, onItemSelect }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-background/95 backdrop-blur md:hidden">
      <Container className="px-3">
        <nav
          aria-label="Primary"
          className="grid grid-cols-4 gap-2 py-3"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.75rem)" }}
        >
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onItemSelect?.(item.id)}
              className={[
                "flex min-h-[48px] flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-xs font-medium shadow-sm transition-all duration-200 hover:shadow-md",
                activeItemId === item.id
                  ? "bg-secondary text-white"
                  : "bg-white text-[#6b7280] hover:text-secondary",
              ].join(" ")}
            >
              <PlaceholderIcon className="h-4 w-4" />
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </nav>
      </Container>
    </div>
  );
}

export default memo(BottomNav);
