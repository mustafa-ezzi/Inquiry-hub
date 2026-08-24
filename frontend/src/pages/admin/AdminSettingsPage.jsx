import { useEffect, useState } from "react";
import {
  fetchSiteConfig,
  saveSiteConfig,
} from "../../services/siteConfigService";

function AdminSettingsPage() {
  const [form, setForm] = useState({
    supportEmail: "",
    supportWhatsAppUrl: "",
    ctaLabel: "",
    ctaTo: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const cfg = await fetchSiteConfig();
        if (!cancelled) setForm(cfg);
      } catch (e) {
        if (!cancelled) setError(e?.message || "Could not load settings.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const next = await saveSiteConfig(form);
      setForm(next);
      setMessage("Saved. Buyer site will use these values on next load.");
    } catch (err) {
      setError(err?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-slate-500">Loading settings…</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Site settings</h1>
      <p className="mt-1 text-sm text-slate-600">
        Support contacts and homepage vendor CTA. Not a full CMS.
      </p>
      <form
        onSubmit={onSubmit}
        className="mt-6 max-w-lg space-y-3 rounded-2xl border border-slate-200 bg-white p-4"
      >
        <Field
          label="Support email"
          value={form.supportEmail}
          onChange={(v) => setForm((f) => ({ ...f, supportEmail: v }))}
        />
        <Field
          label="WhatsApp URL"
          value={form.supportWhatsAppUrl}
          onChange={(v) => setForm((f) => ({ ...f, supportWhatsAppUrl: v }))}
        />
        <Field
          label="CTA label"
          value={form.ctaLabel}
          onChange={(v) => setForm((f) => ({ ...f, ctaLabel: v }))}
        />
        <Field
          label="CTA path"
          value={form.ctaTo}
          onChange={(v) => setForm((f) => ({ ...f, ctaTo: v }))}
        />
        {error ? <p className="text-sm text-rose-700">{error}</p> : null}
        {message ? <p className="text-sm text-[#0F6B36]">{message}</p> : null}
        <button
          type="submit"
          disabled={saving}
          className="min-h-[44px] rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save settings"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, value, onChange }) {
  return (
    <label className="block text-sm">
      <span className="font-semibold text-slate-700">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
      />
    </label>
  );
}

export default AdminSettingsPage;
