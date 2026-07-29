import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { fetchShopById, updateShop } from "../../services/shopsService";

function VendorShopPage() {
  const { shopId } = useOutletContext();
  const [shopName, setShopName] = useState("");
  const [location, setLocation] = useState("");
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!shopId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError("");
      try {
        const shop = await fetchShopById(shopId);
        if (cancelled) return;
        if (!shop) {
          setError("Shop not found.");
          return;
        }
        setShopName(shop.shopName || "");
        setLocation(shop.location === "—" ? "" : shop.location || "");
        setVerified(Boolean(shop.isVerified));
      } catch (e) {
        if (!cancelled) setError(e?.message || "Could not load shop.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [shopId]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!shopId) return;
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      await updateShop(shopId, { shopName, location });
      setSaved(true);
    } catch (err) {
      setError(err?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  if (!shopId) {
    return (
      <p className="text-sm text-slate-500">
        No shop linked. Create one from the{" "}
        <Link to="/" className="font-semibold text-[#0F6B36] underline">
          home page
        </Link>
        .
      </p>
    );
  }

  if (loading) {
    return <p className="text-sm text-slate-500">Loading shop…</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-slate-900">Shop profile</h1>
      <p className="mt-1 text-sm text-slate-600">
        Update the name and location buyers see. Verification is an admin action
        (Phase 5).
      </p>

      <form
        onSubmit={onSubmit}
        className="mt-6 max-w-lg space-y-3 rounded-2xl border border-slate-200 bg-white p-4"
      >
        <label className="block text-sm">
          <span className="font-semibold text-slate-700">Shop name</span>
          <input
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            required
            minLength={2}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#0F6B36]/40 focus:ring-2 focus:ring-[#0F6B36]/15"
          />
        </label>
        <label className="block text-sm">
          <span className="font-semibold text-slate-700">Location</span>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#0F6B36]/40 focus:ring-2 focus:ring-[#0F6B36]/15"
          />
        </label>
        <p className="text-xs text-slate-500">
          Status: {verified ? "Verified" : "Unverified"} · Shop id: {shopId}
        </p>
        <Link
          to={`/shop/${encodeURIComponent(shopId)}`}
          className="inline-block text-xs font-semibold text-[#0F6B36] hover:underline"
        >
          View public shop page
        </Link>
        {error ? <p className="text-sm text-rose-700">{error}</p> : null}
        {saved ? (
          <p className="text-sm text-[#0F6B36]">Saved.</p>
        ) : null}
        <button
          type="submit"
          disabled={saving}
          className="min-h-[44px] rounded-xl bg-[#0F6B36] px-5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}

export default VendorShopPage;
