import { useCallback, useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { validateProductImageFile } from "../../lib/productImageValidation";
import { fetchCategories } from "../../services/categoriesService";
import { uploadProductImage } from "../../services/productImageService";
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
  categoryId: "",
  imageUrl: "",
  location: "",
};

function VendorProductsPage() {
  const { shopId } = useOutletContext();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

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

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const cats = await fetchCategories();
        if (!cancelled) setCategories(cats);
      } catch {
        if (!cancelled) setCategories([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!imageFile) return undefined;
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const resetImageState = () => {
    setImageFile(null);
    setImagePreview("");
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    resetImageState();
    setFormError("");
    setShowForm(true);
  };

  const openEdit = (p) => {
    setEditingId(p.id);
    const catId = String(p.categoryId || p.category_id || "");
    const catName = String(p.category || "");
    setForm({
      name: p.name || "",
      price: p.price === "Get Quote" ? "" : p.price || "",
      description: p.description || "",
      category: catName,
      categoryId: catId,
      imageUrl: p.imageSrc || "",
      location: p.location || "",
    });
    setImageFile(null);
    setImagePreview(p.imageSrc || "");
    setFormError("");
    setShowForm(true);
  };

  const onImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (!file) {
      setImageFile(null);
      return;
    }
    const err = validateProductImageFile(file);
    if (err) {
      setFormError(err);
      e.target.value = "";
      return;
    }
    setFormError("");
    setImageFile(file);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview("");
    setForm((f) => ({ ...f, imageUrl: "" }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!shopId || !user?.uid) return;
    setSaving(true);
    setFormError("");
    try {
      let imageUrl = form.imageUrl || "";
      if (imageFile) {
        imageUrl = await uploadProductImage({
          shopId,
          file: imageFile,
          productId: editingId || "",
        });
      }

      const payload = {
        ...form,
        imageUrl,
        category: form.category,
        categoryId: form.categoryId,
      };
      if (editingId) {
        await updateVendorProduct(editingId, payload);
      } else {
        await createVendorProduct({
          shopId,
          ownerUid: user.uid,
          ...payload,
        });
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      resetImageState();
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
        <Link to="/vendor/shop" className="font-semibold text-[#0F6B36] underline">
          Create a shop
        </Link>{" "}
        before managing products.
      </p>
    );
  }

  const previewSrc = imagePreview || form.imageUrl;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Products</h1>
          <p className="mt-1 text-sm text-slate-600">
            Create and edit listings. Upload a product photo (JPG, PNG, WebP, or
            GIF · max 5 MB).
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
          className="mt-6 space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
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
          <label className="block text-sm">
            <span className="font-semibold text-slate-700">Category *</span>
            {categories.length ? (
              <select
                required
                value={form.categoryId || form.category}
                onChange={(e) => {
                  const id = e.target.value;
                  const cat = categories.find((c) => c.id === id);
                  setForm((f) => ({
                    ...f,
                    categoryId: id,
                    category: cat?.name || "",
                  }));
                }}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#0F6B36]/40 focus:ring-2 focus:ring-[#0F6B36]/15"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                required
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    category: e.target.value,
                    categoryId: e.target.value,
                  }))
                }
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                placeholder="Category"
              />
            )}
          </label>
          <Field
            label="Location"
            value={form.location}
            onChange={(v) => setForm((f) => ({ ...f, location: v }))}
          />

          <div className="block text-sm">
            <span className="font-semibold text-slate-700">Product image</span>
            <div className="mt-2 flex flex-wrap items-start gap-3">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-200 bg-slate-50">
                {previewSrc ? (
                  <img
                    src={previewSrc}
                    alt="Product preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="px-2 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    No image
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={onImageChange}
                  className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-[#0F6B36] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#0d5f30]"
                />
                <p className="text-xs text-slate-500">
                  JPG, PNG, WebP, or GIF · max 5 MB
                  {editingId && form.imageUrl && !imageFile
                    ? " · leave empty to keep the current photo"
                    : ""}
                </p>
                {previewSrc ? (
                  <button
                    type="button"
                    onClick={clearImage}
                    className="text-xs font-semibold text-rose-700 hover:underline"
                  >
                    Remove image
                  </button>
                ) : null}
              </div>
            </div>
          </div>

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
              {saving ? (imageFile ? "Uploading…" : "Saving…") : "Save"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                resetImageState();
              }}
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
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
            >
              <div className="flex min-w-0 items-center gap-3">
                {p.imageSrc ? (
                  <img
                    src={p.imageSrc}
                    alt=""
                    className="h-14 w-14 shrink-0 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#f0faf5] text-xs font-bold text-[#0F6B36]">
                    {(p.name || "?").slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate font-bold text-slate-900">{p.name}</p>
                  <p className="text-sm text-slate-600">
                    {p.price || "Get Quote"}
                    {p.category ? ` · ${p.category}` : ""}
                    {p.hidden ? " · Hidden" : ""}
                  </p>
                  <Link
                    to={`/product/${encodeURIComponent(p.id)}`}
                    className="mt-1 inline-block text-xs font-semibold text-[#0F6B36] hover:underline"
                  >
                    View on site
                  </Link>
                </div>
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
