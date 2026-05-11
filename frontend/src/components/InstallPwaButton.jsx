import { memo, useCallback, useEffect, useState } from "react";

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    window.navigator.standalone === true
  );
}

function isIos() {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function InstallPwaButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    setInstalled(isStandalone());
    setIos(isIos());

    const onBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    return () =>
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  }, []);

  const handleInstallClick = useCallback(async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    if (outcome === "accepted") setInstalled(true);
  }, [deferredPrompt]);

  const handleIosHelp = useCallback(() => {
    window.alert(
      "On iPhone/iPad: tap the Share button (square with arrow), scroll down, then tap “Add to Home Screen”."
    );
  }, []);

  if (installed) return null;

  if (ios) {
    return (
      <button
        type="button"
        onClick={handleIosHelp}
        title="Add to Home Screen"
        className="inline-flex min-h-[40px] max-w-[40vw] shrink-0 items-center gap-1 rounded-xl border border-slate-200 bg-white px-2 py-2 text-[11px] font-semibold text-[#0F6B36] shadow-sm transition-all hover:border-[#0F6B36]/30 hover:bg-[#f0faf5] sm:gap-1.5 sm:px-2.5 sm:text-xs"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 3v10M8 7l4-4 4 4M5 21h14"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="max-w-[7rem] truncate sm:max-w-[9rem]">Add to Home</span>
      </button>
    );
  }

  if (!deferredPrompt) return null;

  return (
    <button
      type="button"
      onClick={handleInstallClick}
      title="Install app"
      className="inline-flex min-h-[40px] max-w-[40vw] shrink-0 items-center gap-1 rounded-xl border border-[#0F6B36]/40 bg-[#0F6B36] px-2 py-2 text-[11px] font-bold text-white shadow-sm transition-all hover:bg-[#0d5f30] sm:gap-1.5 sm:px-2.5 sm:text-xs"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 15v2M8 21h8a2 2 0 002-2v-5M6 11V9a6 6 0 1112 0v2"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <span className="max-w-[6rem] truncate sm:max-w-none">Install app</span>
    </button>
  );
}

export default memo(InstallPwaButton);
