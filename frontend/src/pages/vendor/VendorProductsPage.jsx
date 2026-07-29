import { useCallback, useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  createVendorProduct,
  deleteVendorProduct,
  listVendorProducts,
  updateVendorProduct,
} from "../../services/vendorProductService";

const emptyForm = {
  name: "",
  price: "",
  description: "",
  category: "",
  imageUrl: "",
  location: "",
};

function VendorProductsPage() {
  const { shopId } = useOutletContext();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    if (!shopId) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const rows = await listVendorProducts(shopId);
      setProducts(rows);
    } catch (e) {
      console.error(e);
      setError(e?.message || "Could not load products.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
    setShowForm(true);
  };

  const openEdit = (p) => {
    setEditingId(p.id);
    setForm({
      name: p.name || "",
      price: p.price === "Get Quote" ? "" : p.price || "",
      description: p.description || "",
      category: p.category || "",
      imageUrl: p.imageSrc || "",
      location: p.location || "",
    });
    setFormError("");
    setShowForm(true);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!shopId || !user?.uid) return;
    setSaving(true);
    setFormError("");
    try {
      if (editingId) {
        await updateVendorProduct(editingId, form);
      } else {
        await createVendorProduct({
          shopId,
          ownerUid: user.uid,
          ...form,
        });
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      await load();
    } catch (err) {
      setFormError(err?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Remove this product listing?")) return;
    try {
      await deleteVendorProduct(id);
      await load();
    } catch (err) {
      setError(err?.message || "Delete failed.");
    }
  };

  if (!shopId) {
    return (
      <p className="text-sm text-slate-500">
        Link a shop before managing products.
      </p>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Products</h1>
          <p className="mt-1 text-sm text-slate-600">
            Create and edit listings. Use an image URL (Storage uploads in a later phase).
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex min-h-[44px] items-center rounded-xl bg-[#0F6B36] px-4 text-sm font-semibold text-white hover:bg-[#0d5f30]"
        >
          Add product
        </button>
      </div>

      {error ? (
        <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {error}
        </p>
      ) : null}

      {showForm ? (
        <form
          onSubmit={onSubmit}
          className="mt-6 space-y-3 rounded-2xl border border-slate-200 bg-white p-4"
        >
          <h2 className="font-bold text-slate-900">
            {editingId ? "Edit product" : "New product"}
          </h2>
          <Field
            label="Name"
            value={form.name}
            onChange={(v) => setForm((f) => ({ ...f, name: v }))}
            required
          />
          <Field
            label="Price (blank = Get Quote)"
            value={form.price}
            onChange={(v) => setForm((f) => ({ ...f, price: v }))}
          />
          <Field
            label="Category"
            value={form.category}
            onChange={(v) => setForm((f) => ({ ...f, category: v }))}
          />
          <Field
            label="Location"
            value={form.location}
            onChange={(v) => setForm((f) => ({ ...f, location: v }))}
          />
          <Field
            label="Image URL"
            value={form.imageUrl}
            onChange={(v) => setForm((f) => ({ ...f, imageUrl: v }))}
          />
          <label className="block text-sm">
            <span className="font-semibold text-slate-700">Description</span>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              rows={3}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#0F6B36]/40 focus:ring-2 focus:ring-[#0F6B36]/15"
            />
          </label>
          {formError ? (
            <p className="text-sm text-rose-700">{formError}</p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={saving}
              className="min-h-[44px] rounded-xl bg-[#0F6B36] px-4 text-sm font-semibold text-white disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="min-h-[44px] rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      <ul className="mt-6 space-y-2">
        {loading ? (
          <li className="text-sm text-slate-500">Loading…</li>
        ) : products.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
            No products yet. Add your first listing.
          </li>
        ) : (
          products.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3"
            >
              <div>
                <p className="font-bold text-slate-900">{p.name}</p>
                <p className="text-sm text-slate-600">
                  {p.price || "Get Quote"}
                  {p.category ? ` · ${p.category}` : ""}
                </p>
                <Link
                  to={`/product/${encodeURIComponent(p.id)}`}
                  className="mt-1 inline-block text-xs font-semibold text-[#0F6B36] hover:underline"
                >
                  View on site
                </Link>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(p)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(p.id)}
                  className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                >
                  Delete
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

function Field({ label, value, onChange, required }) {
  return (
    <label className="block text-sm">
      <span className="font-semibold text-slate-700">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#0F6B36]/40 focus:ring-2 focus:ring-[#0F6B36]/15"
      />
    </label>
  );
}

export default VendorProductsPage;
