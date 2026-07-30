import { memo, useEffect, useState } from "react";
import { Link } from "react-router-dom";

function InquiryOnboardingForm({
  onSubmit,
  submitting,
  error,
  defaultName = "",
  defaultPhone = "",
}) {
  const [buyerName, setBuyerName] = useState(defaultName);
  const [phone, setPhone] = useState(defaultPhone);
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    if (defaultName) setBuyerName(defaultName);
    if (defaultPhone) setPhone(defaultPhone);
  }, [defaultName, defaultPhone]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!consent) return;
    onSubmit({ buyerName, phone, message, consent: true });
  };

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-8 md:py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <h2 className="text-lg font-extrabold text-[#111827]">Start your inquiry</h2>
        <p className="mt-2 text-sm leading-relaxed text-[#6b7280]">
          Tell the vendor who you are and what you need. They will reply in this
          thread.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div className="space-y-1.5">
            <label htmlFor="inq-name" className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Your name
            </label>
            <input
              id="inq-name"
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none ring-[#0F6B36]/30 focus:border-[#0F6B36]/40 focus:ring-2"
              placeholder="Full name"
              autoComplete="name"
              required
              maxLength={120}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="inq-phone" className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Phone / WhatsApp
            </label>
            <input
              id="inq-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none ring-[#0F6B36]/30 focus:border-[#0F6B36]/40 focus:ring-2"
              placeholder="03xx xxxxxxx"
              autoComplete="tel"
              required
              maxLength={20}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="inq-msg" className="text-xs font-bold uppercase tracking-wider text-slate-500">
              First message
            </label>
            <textarea
              id="inq-msg"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full resize-y rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none ring-[#0F6B36]/30 focus:border-[#0F6B36]/40 focus:ring-2"
              placeholder="Quantity, delivery city, timeline…"
              required
              maxLength={2000}
            />
          </div>
          <label className="flex items-start gap-2.5 text-sm leading-5 text-slate-600">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-[#0F6B36] focus:ring-[#0F6B36]"
              required
            />
            <span>
              I agree that my name and phone may be shared with this vendor to
              handle my inquiry, as described in the{" "}
              <Link
                to="/privacy"
                className="font-semibold text-[#0F6B36] underline"
                target="_blank"
                rel="noreferrer"
              >
                Privacy Policy
              </Link>
              .
            </span>
          </label>
          {error ? (
            <p className="text-sm font-medium text-rose-600" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={submitting || !consent}
            className="min-h-[48px] rounded-xl bg-[#0F6B36] px-4 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#0d5f30] disabled:opacity-60"
          >
            {submitting ? "Starting…" : "Start inquiry"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default memo(InquiryOnboardingForm);
