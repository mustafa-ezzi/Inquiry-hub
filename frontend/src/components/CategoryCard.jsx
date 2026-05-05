import { memo } from "react";
import PlaceholderIcon from "./PlaceholderIcon";

function CategoryCard({
  name,
  icon: Icon = PlaceholderIcon,
  href,
  onClick,
  className = "",
}) {
  const classes = [
    "group flex min-h-[120px] w-full flex-col items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-secondary/20 hover:bg-secondary/5 hover:shadow-lg",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/10 text-secondary transition-colors duration-200 group-hover:bg-secondary/15">
        <Icon className="h-5 w-5" />
      </span>
      <span className="text-sm font-semibold text-slate-900">{name}</span>
    </>
  );

  if (href) {
    return (
      <a href={href} className={classes}>
        {content}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={classes}>
      {content}
    </button>
  );
}

export default memo(CategoryCard);
