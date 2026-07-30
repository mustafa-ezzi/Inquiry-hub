import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  readCookieConsent,
  writeCookieConsent,
} from "../lib/cookieConsent";

function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(readCookieConsent() === null);
  }, []);

  if (!visible) return null;

  const choose = (value) => {
    writeCookieConsent(value);
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Cookie and analytics notice"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur md:p-5"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm leading-6 text-slate-600">
          We use essential storage for sign-in. Optional analytics help us improve
          inquiry funnel metrics. See our{" "}
          <Link to="/privacy" className="font-semibold text-[#0F6B36] underline">
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={() => choose("declined")}
            className="min-h-[40px] rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => choose("accepted")}
            className="min-h-[40px] rounded-xl bg-[#0F6B36] px-4 text-sm font-semibold text-white hover:bg-[#0d5f30]"
          >
            Accept analytics
          </button>
        </div>
      </div>
    </div>
  );
}

export default CookieConsentBanner;
