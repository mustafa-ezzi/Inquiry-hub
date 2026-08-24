import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { mapCategoryIcon } from "../lib/categoryIcons";

export const CATEGORIES_COLLECTION = "categories";

function parseOptionalNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const n = Number(value.trim());
    return Number.isNaN(n) ? undefined : n;
  }
  return undefined;
}

/**
 * @param {string} id
 * @param {Record<string, unknown>} data
 */
export function mapCategoryDoc(id, data = {}) {
  const name =
    typeof data.name === "string" && data.name.trim()
      ? data.name.trim()
      : "Category";
  const sortOrder =
    typeof data.sortOrder === "number"
      ? data.sortOrder
      : typeof data.order === "number"
        ? data.order
        : 9999;
  const iconKey = data.icon || data.iconKey || "hammer";
  const legacyId = parseOptionalNumber(
    data.legacyId ?? data.legacy_id ?? data.numericId
  );
  return {
    id,
    name,
    iconKey: String(iconKey),
    icon: mapCategoryIcon(iconKey),
    sortOrder,
    ...(legacyId != null ? { legacyId } : {}),
  };
}

export async function fetchCategories() {
  const snapshot = await getDocs(collection(db, CATEGORIES_COLLECTION));
  const rows = snapshot.docs.map((docSnap) =>
    mapCategoryDoc(docSnap.id, docSnap.data())
  );
  rows.sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
  });
  return rows.map(({ id, name, icon, legacyId, iconKey, sortOrder }) => ({
    id,
    name,
    icon,
    iconKey,
    sortOrder,
    ...(legacyId != null ? { legacyId } : {}),
  }));
}

/**
 * @param {{ name: string, iconKey?: string, sortOrder?: number }} args
 */
export async function createCategory({
  name,
  iconKey = "hammer",
  sortOrder = 100,
}) {
  const n = String(name || "").trim();
  if (n.length < 2) throw new Error("Category name is required.");
  const ref = await addDoc(collection(db, CATEGORIES_COLLECTION), {
    name: n,
    icon: String(iconKey || "hammer"),
    sortOrder: Number(sortOrder) || 100,
    created_at: serverTimestamp(),
  });
  return { id: ref.id };
}

/**
 * @param {string} id
 * @param {{ name?: string, iconKey?: string, sortOrder?: number }} patch
 */
export async function updateCategory(id, patch) {
  if (!id) throw new Error("Missing category id.");
  const next = { updated_at: serverTimestamp() };
  if (typeof patch.name === "string") next.name = patch.name.trim();
  if (typeof patch.iconKey === "string") next.icon = patch.iconKey.trim();
  if (patch.sortOrder != null) next.sortOrder = Number(patch.sortOrder) || 0;
  await updateDoc(doc(db, CATEGORIES_COLLECTION, id), next);
}

export async function deleteCategory(id) {
  if (!id) throw new Error("Missing category id.");
  await deleteDoc(doc(db, CATEGORIES_COLLECTION, id));
}
