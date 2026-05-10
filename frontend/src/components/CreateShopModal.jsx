import { memo, useCallback, useEffect, useId, useState } from "react";
import { createShop } from "../services/shopsService";

function CreateShopModal({ isOpen, onClose, onCreated }) {
  const titleId = useId();
  const [shopName, setShopName] = useState("");
  const [location, setLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setShopName("");
      setLocation("");
      setError("");
      setSubmitting(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const name = shopName.trim();
      const loc = location.trim();
      if (!name || !loc) {
        setError("Shop name and location are required.");
        return;
      }
      setError("");
      setSubmitting(true);
      try {
        await createShop({ shopName: name, location: loc });
        onCreated?.();
        onClose();
      } catch (err) {
        console.error(err);
        setError(
          err?.code === "permission-denied"
            ? "Permission denied. Check Firestore security rules for the “shops” collection."
            : "Could not save your shop. Try again."
        );
      } finally {
        setSubmitting(false);
      }
    },
    [shopName, location, onClose, onCreated]
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-900/50 p-4 sm:items-center"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="max-h-[min(90vh,640px)] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
      >
        <h2 id={titleId} className="text-lg font-bold text-[#111827]">
          Create your shop
        </h2>
        <p className="mt-1.5 text-sm text-[#6b7280]">
          List your business on InquireHub. You can verify your shop later.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          <div className="space-y-1.5">
            <label
              htmlFor="create-shop-name"
              className="text-xs font-bold uppercase tracking-wider text-slate-500"
            >
              Shop name
            </label>
            <input
              id="create-shop-name"
              type="text"
              value={shopName}
              onChange={(ev) => setShopName(ev.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none ring-[#0F6B36]/40 transition-shadow focus:border-[#0F6B36]/50 focus:ring-2"
              placeholder="e.g. Ali Hardware Store"
              autoComplete="organization"
              maxLength={120}
              disabled={submitting}
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="create-shop-location"
              className="text-xs font-bold uppercase tracking-wider text-slate-500"
            >
              City / area
            </label>
            <input
              id="create-shop-location"
              type="text"
              value={location}
              onChange={(ev) => setLocation(ev.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none ring-[#0F6B36]/40 transition-shadow focus:border-[#0F6B36]/50 focus:ring-2"
              placeholder="e.g. Karachi"
              autoComplete="address-level2"
              maxLength={80}
              disabled={submitting}
            />
          </div>

          {error ? (
            <p className="text-sm font-medium text-rose-600" role="alert">
              {error}
            </p>
          ) : null}

          <div className="flex flex-wrap justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] rounded-xl border border-slate-200 px-4 text-sm font-semibold text-[#374151] transition-colors hover:bg-slate-50"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="min-h-[44px] rounded-xl bg-[#0F6B36] px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0d5f30] disabled:opacity-60"
            >
              {submitting ? "Saving…" : "Create shop"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default memo(CreateShopModal);
