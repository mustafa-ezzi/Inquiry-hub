import { memo, useCallback, useState } from "react";

const baseUrl = import.meta.env.BASE_URL;
const LOGO_PATH = `${baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`}logo.png`;

function BrandLogo({
  brand,
  size = "md",
  showWordmark = true,
  wordmarkClassName = "",
  className = "",
  imgClassName = "",
}) {
  const [useFallback, setUseFallback] = useState(false);

  const onImgError = useCallback(() => setUseFallback(true), []);

  const shell =
    size === "sm"
      ? "h-8 w-8 rounded-lg"
      : size === "lg"
        ? "h-12 w-12 rounded-2xl"
        : "h-10 w-10 rounded-xl";

  const textSize =
    size === "sm" ? "text-xs" : size === "lg" ? "text-sm" : "text-sm";

  return (
    <span className={["flex shrink-0 items-center gap-3", className].join(" ")}>
      {useFallback ? (
        <span
          className={`flex ${shell} items-center justify-center bg-[#0F6B36] font-bold text-white shadow-lg shadow-[#0F6B36]/20 ${textSize}`}
          aria-hidden={!!brand?.name}
        >
          {brand?.shortName ?? ""}
        </span>
      ) : (
        <span
          className={`flex ${shell} items-center justify-center overflow-hidden bg-white shadow-md shadow-slate-200/60 ring-1 ring-slate-100`}
        >
          <img
            src={LOGO_PATH}
            alt={brand?.name ? `${brand.name} logo` : "Site logo"}
            width={size === "sm" ? 32 : size === "lg" ? 48 : 40}
            height={size === "sm" ? 32 : size === "lg" ? 48 : 40}
            decoding="async"
            className={["h-full w-full object-contain p-0.5", imgClassName].join(
              " "
            )}
            onError={onImgError}
          />
        </span>
      )}
      {showWordmark && brand?.name && (
        <span
          className={[
            "font-bold tracking-tight text-slate-900",
            size === "sm" ? "text-sm" : "text-base",
            wordmarkClassName,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {brand.name}
        </span>
      )}
    </span>
  );
}

export default memo(BrandLogo);
