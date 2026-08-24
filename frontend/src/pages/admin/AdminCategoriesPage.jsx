import { useCallback, useEffect, useState } from "react";
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  updateCategory,
} from "../../services/categoriesService";

function AdminCategoriesPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [iconKey, setIconKey] = useState("hammer");
  const [sortOrder, setSortOrder] = useState(100);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setRows(await fetchCategories());
    } catch (e) {
      setError(e?.message || "Could not load categories.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const onCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await createCategory({ name, iconKey, sortOrder });
      setName("");
      await load();
    } catch (err) {
      setError(err?.message || "Create failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Categories</h1>
      <p className="mt-1 text-sm text-slate-600">
        Manage catalog categories shown on the home page.
      </p>

      <form
        onSubmit={onCreate}
        className="mt-6 space-y-3 rounded-2xl border border-slate-200 bg-white p-4"
      >
        <h2 className="font-bold">Add category</h2>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          required
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
        />
        <div className="flex flex-wrap gap-2">
          <input
            value={iconKey}
            onChange={(e) => setIconKey(e.target.value)}
            placeholder="Icon key"
            className="min-w-[8rem] flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            className="w-28 rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </form>

      {error ? (
        <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {error}
        </p>
      ) : null}

      <ul className="mt-6 space-y-2">
        {loading ? (
          <li className="text-sm text-slate-500">Loading…</li>
        ) : (
          rows.map((c) => (
            <li
              key={c.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3"
            >
              <div>
                <p className="font-bold">{c.name}</p>
                <p className="text-xs text-slate-500">
                  icon {c.iconKey} · order {c.sortOrder}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold"
                  onClick={async () => {
                    const next = window.prompt("Rename category", c.name);
                    if (!next) return;
                    try {
                      await updateCategory(c.id, { name: next });
                      await load();
                    } catch (err) {
                      setError(err?.message || "Update failed.");
                    }
                  }}
                >
                  Rename
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700"
                  onClick={async () => {
                    if (!window.confirm(`Delete ${c.name}?`)) return;
                    try {
                      await deleteCategory(c.id);
                      await load();
                    } catch (err) {
                      setError(err?.message || "Delete failed.");
                    }
                  }}
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

export default AdminCategoriesPage;
