import { collection, getDocs } from "firebase/firestore";
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

export async function fetchCategories() {
  const snapshot = await getDocs(collection(db, CATEGORIES_COLLECTION));
  const rows = snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
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
      id: docSnap.id,
      name,
      icon: mapCategoryIcon(iconKey),
      _sortOrder: sortOrder,
      ...(legacyId != null ? { legacyId } : {}),
    };
  });
  rows.sort((a, b) => {
    if (a._sortOrder !== b._sortOrder) return a._sortOrder - b._sortOrder;
    return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
  });
  return rows.map(({ id, name, icon, legacyId }) => ({
    id,
    name,
    icon,
    ...(legacyId != null ? { legacyId } : {}),
  }));
}
