import { memo, useCallback, useEffect, useState } from "react";
import {
  applyPwaUpdate,
  subscribePwaUpdateAvailable,
} from "../lib/pwaUpdateChannel";

function PwaUpdateScreen() {
  const [open, setOpen] = useState(false);
  const [entered, setEntered] = useState(false);
  const [updating, setUpdating] = useState(false);

  const show = useCallback(() => {
    setOpen(true);
    setEntered(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setEntered(true));
    });
  }, []);

  useEffect(() => {
    const unsub = subscribePwaUpdateAvailable(show);
    return unsub;
  }, [show]);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return undefined;
    let cancelled = false;

    const checkWaiting = async () => {
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        if (cancelled || !reg?.waiting) return;
        show();
      } catch { /* ignore */ }
    };

    const pingUpdate = async () => {
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        await reg?.update();
        await checkWaiting();
      } catch { /* ignore */ }
    };

    if (document.readyState === "complete") {
      void pingUpdate();
    } else {
      window.addEventListener("load", () => void pingUpdate(), { once: true });
    }

    const onVisible = () => {
      if (document.visibilityState === "visible") void pingUpdate();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [show]);

  const handleUpdate = useCallback(async () => {
    setUpdating(true);
    try {
      await applyPwaUpdate();
    } catch {
      setUpdating(false);
      window.location.reload();
    }
  }, []);

  const handleLater = useCallback(() => {
    setEntered(false);
    window.setTimeout(() => setOpen(false), 280);
  }, []);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pwa-update-title"
      aria-describedby="pwa-update-desc"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Dismiss update notice"
        className={[
          "absolute inset-0 transition-opacity duration-300 ease-out",
          "bg-[#050e18]/80 backdrop-blur-sm",
          entered ? "opacity-100" : "opacity-0",
        ].join(" ")}
        onClick={handleLater}
      />

      {/* Sheet */}
      <div
        className={[
          "relative z-[1] w-full max-w-sm mx-4",
          "rounded-[24px] sm:rounded-[24px]",
          "bg-white/[0.07] backdrop-blur-2xl",
          "border border-white/[0.13]",
          "shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]",
          "px-7 pb-7 pt-8",
          "transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          entered
            ? "translate-y-0 opacity-100 scale-100"
            : "translate-y-10 opacity-0 scale-[0.97]",
        ].join(" ")}
      >
        {/* Icon */}
        <div className="flex justify-center mb-5">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-[#0F6B36]/25 border border-[#0F6B36]/40 flex items-center justify-center animate-pulse">
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                className="text-[#4ade80]"
                aria-hidden
              >
                <path
                  d="M12 4v12m0 0l-3-3m3 3l3-3M6 20h12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            {/* Live badge */}
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#22c55e] rounded-full border-2 border-[#0d1f10]" />
          </div>
        </div>

        <h2
          id="pwa-update-title"
          className="text-center text-xl font-semibold tracking-tight text-[#f0fdf4]"
        >
          Update available
        </h2>
        <p
          id="pwa-update-desc"
          className="mt-2.5 text-center text-sm leading-relaxed text-[#d1fae5]/60"
        >
          A new version of InquireHub is ready. Update now for the latest
          improvements and best experience.
        </p>

        <div className="mt-7 flex flex-col gap-2.5">
          <button
            type="button"
            disabled={updating}
            onClick={handleUpdate}
            className={[
              "min-h-[48px] w-full rounded-[14px]",
              "bg-[#0F6B36] text-white text-sm font-medium",
              "shadow-[0_4px_16px_rgba(15,107,54,0.45),inset_0_1px_0_rgba(255,255,255,0.15)]",
              "transition-all duration-200 hover:bg-[#0d5f30] active:scale-[0.98]",
              "disabled:opacity-60",
            ].join(" ")}
          >
            {updating ? "Updating…" : "Update now"}
          </button>

          <button
            type="button"
            disabled={updating}
            onClick={handleLater}
            className={[
              "min-h-[44px] w-full rounded-[14px]",
              "bg-white/[0.06] border border-white/[0.12]",
              "text-[#d1fae5]/70 text-sm",
              "transition-colors hover:bg-white/[0.1]",
              "disabled:opacity-50",
            ].join(" ")}
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(PwaUpdateScreen);