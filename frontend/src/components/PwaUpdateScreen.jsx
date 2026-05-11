import { memo, useCallback, useEffect, useState } from "react";
import {
  applyPwaUpdate,
  subscribePwaUpdateAvailable,
} from "../lib/pwaUpdateChannel";

/**
 * Full-screen in-app prompt when a new service worker is ready (after redeploy).
 * Also shows if a "waiting" worker already exists when the app opens.
 */
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
      } catch {
        /* ignore */
      }
    };

    const pingUpdate = async () => {
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        await reg?.update();
        await checkWaiting();
      } catch {
        /* ignore */
      }
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
      <button
        type="button"
        aria-label="Dismiss update notice"
        className={[
          "absolute inset-0 bg-slate-900/55 backdrop-blur-[2px] transition-opacity duration-300 ease-out",
          entered ? "opacity-100" : "opacity-0",
        ].join(" ")}
        onClick={handleLater}
      />

      <div
        className={[
          "relative z-[1] w-full max-w-md rounded-t-[28px] border border-white/20 bg-white px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-7 shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:rounded-3xl sm:pb-8",
          entered
            ? "translate-y-0 opacity-100 sm:scale-100"
            : "translate-y-full opacity-90 sm:translate-y-4 sm:scale-[0.96]",
        ].join(" ")}
      >
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f0faf5] ring-2 ring-[#0F6B36]/15">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            className="text-[#0F6B36]"
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

        <h2
          id="pwa-update-title"
          className="text-center text-xl font-extrabold tracking-tight text-[#111827]"
        >
          Update available
        </h2>
        <p
          id="pwa-update-desc"
          className="mt-2.5 text-center text-sm leading-relaxed text-[#6b7280]"
        >
          We&apos;ve improved InquireHub. Tap update for the latest version and
          the best experience.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row-reverse sm:justify-center">
          <button
            type="button"
            disabled={updating}
            onClick={handleUpdate}
            className="min-h-[48px] w-full rounded-2xl bg-[#0F6B36] px-6 text-sm font-bold text-white shadow-lg shadow-[#0F6B36]/25 transition-transform duration-200 hover:bg-[#0d5f30] active:scale-[0.98] disabled:opacity-70 sm:min-w-[160px]"
          >
            {updating ? "Updating…" : "Update now"}
          </button>
          <button
            type="button"
            disabled={updating}
            onClick={handleLater}
            className="min-h-[48px] w-full rounded-2xl border border-slate-200 bg-white px-6 text-sm font-semibold text-[#374151] transition-colors hover:bg-slate-50 sm:min-w-[120px]"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(PwaUpdateScreen);
