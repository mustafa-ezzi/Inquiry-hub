import { memo } from "react";
import PlaceholderIcon from "./PlaceholderIcon";

function InfoCard({
  title,
  description,
  icon: Icon = PlaceholderIcon,
  eyebrow,
  className = "",
}) {
  const classes = [
    "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={classes}>
      <div className="flex flex-col gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
          <Icon className="h-5 w-5" />
        </span>
        <div className="space-y-2">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary">
              {eyebrow}
            </p>
          ) : null}
          <h3 className="text-base font-semibold text-[#111827]">{title}</h3>
          <p className="text-sm leading-6 text-[#6b7280]">{description}</p>
        </div>
      </div>
    </article>
  );
}

export default memo(InfoCard);
