import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { createShop, fetchShopById, updateShop } from "../../services/shopsService";

function VendorShopPage() {
  const { shopId } = useOutletContext();
  const { user, linkShop, refreshProfile } = useAuth();
  const [shopName, setShopName] = useState("");
  const [location, setLocation] = useState("");
  const [verified, setVerified] = useState(false);
  const [repliesQuickly, setRepliesQuickly] = useState(false);
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
        setRepliesQuickly(Boolean(shop.repliesQuickly));
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

  const onCreate = async (e) => {
    e.preventDefault();
    if (!user?.uid) return;
    setSaving(true);
    setError("");
    try {
      const { id } = await createShop({
        shopName,
        location: location || "Pakistan",
        ownerUid: user.uid,
      });
      await linkShop(id);
      await refreshProfile?.();
      window.location.assign("/vendor/shop");
    } catch (err) {
      setError(err?.message || "Could not create shop.");
      setSaving(false);
    }
  };

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
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Create your shop</h1>
        <p className="mt-1 text-sm text-slate-600">
          Set up the public shop buyers will see when they inquire.
        </p>
        <form
          onSubmit={onCreate}
          className="mt-6 max-w-lg space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
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
          {error ? <p className="text-sm text-rose-700">{error}</p> : null}
          <button
            type="submit"
            disabled={saving}
            className="min-h-[44px] rounded-xl bg-[#0F6B36] px-5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving ? "Creating…" : "Create shop"}
          </button>
        </form>
      </div>
    );
  }

  if (loading) {
    return <p className="text-sm text-slate-500">Loading shop…</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-slate-900">Shop profile</h1>
      <p className="mt-1 text-sm text-slate-600">
        Update the name and location buyers see. Verification and trust badges
        are managed by platform admins.
      </p>

      <form
        onSubmit={onSubmit}
        className="mt-6 max-w-lg space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
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
          {verified ? "Verified" : "Unverified"}
          {repliesQuickly ? " · Replies quickly" : ""}
          {" · "}
          Shop id: {shopId}
        </p>
        <Link
          to={`/shop/${encodeURIComponent(shopId)}`}
          className="inline-block text-xs font-semibold text-[#0F6B36] hover:underline"
        >
          View public shop page
        </Link>
        {error ? <p className="text-sm text-rose-700">{error}</p> : null}
        {saved ? <p className="text-sm text-[#0F6B36]">Saved.</p> : null}
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
