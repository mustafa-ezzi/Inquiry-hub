import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  ANTARIA_STEELS_SHOP_ID,
  associateProductsWithShop,
  backfillProductVendorNames,
  createProductAdmin,
  listProductsAdmin,
  setProductHidden,
} from "../../services/adminCatalogService";
import { fetchCategories } from "../../services/categoriesService";
import { listShopsForAdmin } from "../../services/shopsService";

const emptyForm = {
  name: "",
  price: "",
  description: "",
  category: "",
  categoryId: "",
  imageUrl: "",
  location: "",
  shopId: "",
};

function AdminProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [shops, setShops] = useState([]);
  const [categories, setCategories] = useState([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [prods, shopRows, cats] = await Promise.all([
        listProductsAdmin(),
        listShopsForAdmin(),
        fetchCategories().catch(() => []),
      ]);
      setProducts(prods);
      setShops(shopRows);
      setCategories(cats);
      setForm((f) => ({
        ...f,
        shopId: f.shopId || ANTARIA_STEELS_SHOP_ID || shopRows[0]?.id || "",
      }));
    } catch (e) {
      setError(e?.message || "Could not load products.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (filter === "hidden" && !p.hidden) return false;
      if (filter === "visible" && p.hidden) return false;
      if (!q) return true;
      return [p.name, p.category, p.vendorName, p.id, p.shopId]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [products, query, filter]);

  const toggle = async (p) => {
    setBusyId(p.id);
    setError("");
    try {
      await setProductHidden(p.id, !p.hidden);
      await load();
    } catch (e) {
      setError(e?.message || "Update failed.");
    } finally {
      setBusyId("");
    }
  };

  const onCreate = async (e) => {
    e.preventDefault();
    if (!user?.uid) return;
    setSaving(true);
    setFormError("");
    setMessage("");
    try {
      await createProductAdmin({
        shopId: form.shopId,
        ownerUid: user.uid,
        name: form.name,
        price: form.price,
        description: form.description,
        category: form.category,
        categoryId: form.categoryId,
        imageUrl: form.imageUrl,
        location: form.location,
      });
      setShowForm(false);
      setForm((f) => ({ ...emptyForm, shopId: f.shopId }));
      setMessage("Product created.");
      await load();
    } catch (err) {
      setFormError(err?.message || "Could not create product.");
    } finally {
      setSaving(false);
    }
  };

  const runAssociate = async (onlyMissing) => {
    const shopId = ANTARIA_STEELS_SHOP_ID;
    const ok = window.confirm(
      onlyMissing
        ? "Assign all products missing a shop to Antaria Steels?"
        : "Assign ALL products to Antaria Steels and set vendor names?"
    );
    if (!ok) return;
    setBusyId("assoc");
    setError("");
    setMessage("");
    try {
      const r = await associateProductsWithShop(shopId, {
        onlyMissingShop: onlyMissing,
      });
      setMessage(`Updated ${r.updated} products → ${r.shopName}.`);
      await load();
    } catch (e) {
      setError(e?.message || "Associate failed.");
    } finally {
      setBusyId("");
    }
  };

  const runBackfill = async () => {
    setBusyId("backfill");
    setError("");
    setMessage("");
    try {
      const r = await backfillProductVendorNames(ANTARIA_STEELS_SHOP_ID);
      setMessage(`Backfilled vendor names on ${r.updated} products.`);
      await load();
    } catch (e) {
      setError(e?.message || "Backfill failed.");
    } finally {
      setBusyId("");
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Products</h1>
          <p className="mt-1 text-sm text-slate-600">
            Create listings with real Firestore fields, hide/restore, and repair
            shop associations.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowForm(true);
            setFormError("");
          }}
          className="min-h-[40px] rounded-xl bg-[#0F6B36] px-4 text-sm font-semibold text-white"
        >
          Add product
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busyId === "assoc"}
          onClick={() => runAssociate(true)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
        >
          Assign orphans → Antaria
        </button>
        <button
          type="button"
          disabled={busyId === "assoc"}
          onClick={() => runAssociate(false)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
        >
          Assign all → Antaria
        </button>
        <button
          type="button"
          disabled={busyId === "backfill"}
          onClick={() => void runBackfill()}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
        >
          Fix unknown vendor (Antaria)
        </button>
      </div>

      {showForm ? (
        <form
          onSubmit={onCreate}
          className="mt-6 space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <h2 className="font-bold">New product</h2>
          <label className="block text-sm">
            <span className="font-semibold">Shop *</span>
            <select
              required
              value={form.shopId}
              onChange={(e) =>
                setForm((f) => ({ ...f, shopId: e.target.value }))
              }
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Select shop</option>
              {shops.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.shopName} ({s.id.slice(0, 6)}…)
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-semibold">Name *</span>
            <input
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="font-semibold">Price (blank = Get Quote)</span>
            <input
              value={form.price}
              onChange={(e) =>
                setForm((f) => ({ ...f, price: e.target.value }))
              }
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="font-semibold">Category *</span>
            <select
              required
              value={form.categoryId}
              onChange={(e) => {
                const id = e.target.value;
                const cat = categories.find((c) => c.id === id);
                setForm((f) => ({
                  ...f,
                  categoryId: id,
                  category: cat?.name || "",
                }));
              }}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-semibold">Location</span>
            <input
              value={form.location}
              onChange={(e) =>
                setForm((f) => ({ ...f, location: e.target.value }))
              }
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="font-semibold">Image URL</span>
            <input
              value={form.imageUrl}
              onChange={(e) =>
                setForm((f) => ({ ...f, imageUrl: e.target.value }))
              }
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="https://…"
            />
          </label>
          <label className="block text-sm">
            <span className="font-semibold">Description</span>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              rows={3}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          {formError ? (
            <p className="text-sm text-rose-700">{formError}</p>
          ) : null}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="min-h-[40px] rounded-xl bg-[#0F6B36] px-4 text-sm font-semibold text-white disabled:opacity-50"
            >
              {saving ? "Saving…" : "Create"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="min-h-[40px] rounded-xl border border-slate-200 px-4 text-sm font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search…"
          className="min-h-[40px] flex-1 rounded-xl border border-slate-200 px-3 text-sm"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="min-h-[40px] rounded-xl border border-slate-200 px-3 text-sm"
        >
          <option value="all">All</option>
          <option value="visible">Visible</option>
          <option value="hidden">Hidden</option>
        </select>
      </div>
      {message ? (
        <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {error}
        </p>
      ) : null}
      <ul className="mt-6 space-y-2">
        {loading ? (
          <li className="text-sm text-slate-500">Loading…</li>
        ) : filtered.length === 0 ? (
          <li className="text-sm text-slate-500">No products match.</li>
        ) : (
          filtered.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3"
            >
              <div>
                <p className="font-bold">{p.name}</p>
                <p className="text-sm text-slate-600">
                  {p.vendorName || "Unknown vendor"}
                  {p.price ? ` · ${p.price}` : " · Get Quote"}
                  {p.category ? ` · ${p.category}` : ""}
                  {p.hidden ? " · Hidden" : ""}
                </p>
                <Link
                  to={`/product/${encodeURIComponent(p.id)}`}
                  className="text-xs font-semibold text-[#0F6B36] hover:underline"
                >
                  View
                </Link>
              </div>
              <button
                type="button"
                disabled={busyId === p.id}
                onClick={() => toggle(p)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                {p.hidden ? "Unhide" : "Hide"}
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default AdminProductsPage;
