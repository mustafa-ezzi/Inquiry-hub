import { memo } from "react";
import PlaceholderIcon from "./PlaceholderIcon";

function SearchBar({
  placeholder,
  buttonLabel,
  icon: Icon = PlaceholderIcon,
  className = "",
  inputClassName = "",
  compact = false,
  value = "",
  onChange,
  name = "search",
  type = "search",
}) {
  const wrapperClasses = [
    "flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-all duration-200 hover:border-secondary/40 hover:shadow-md focus-within:border-secondary/40 focus-within:shadow-md",
    compact ? "min-h-[44px]" : "min-h-[56px] py-3.5",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const fieldClasses = [
    "flex min-w-0 flex-1 items-center gap-3 text-sm text-[#6b7280]",
    inputClassName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={wrapperClasses}>
      <div className={fieldClasses}>
        <Icon className="h-4 w-4 shrink-0 text-[#d1d5db]" />
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full min-w-0 border-0 bg-transparent p-0 text-sm text-[#111827] outline-none placeholder:text-[#d1d5db]"
        />
      </div>

      {buttonLabel ? (
        <button
          type="button"
          className="min-h-[44px] shrink-0 rounded-2xl bg-secondary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:brightness-95 hover:shadow-md"
        >
          {buttonLabel}
        </button>
      ) : null}
    </div>
  );
}

export default memo(SearchBar);
