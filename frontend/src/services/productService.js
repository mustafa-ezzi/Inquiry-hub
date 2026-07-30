import {
  collection,
  getDocs,
  limit,
  query,
  startAfter,
  orderBy,
  where,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { mapProductRecord } from "../lib/mapProduct";

export const PRODUCTS_COLLECTION = "products";

/**
 * @param {import("firebase/firestore").QueryDocumentSnapshot | null} lastDoc
 */
export async function fetchProducts(lastDoc = null) {
  let q = query(
    collection(db, PRODUCTS_COLLECTION),
    orderBy("created_at", "desc"),
    limit(20)
  );

  if (lastDoc) {
    q = query(
      collection(db, PRODUCTS_COLLECTION),
      orderBy("created_at", "desc"),
      startAfter(lastDoc),
      limit(20)
    );
  }

  const snapshot = await getDocs(q);

  return {
    products: snapshot.docs
      .map((docSnap) =>
        mapProductRecord({ id: docSnap.id, ...docSnap.data() }, docSnap.id)
      )
      .filter((p) => !p.hidden),
    lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
  };
}

/**
 * Products belonging to a shop (shopId / shop_id / vendor id fields).
 * @param {string} shopId
 * @param {number} [max]
 * @param {{ includeHidden?: boolean }} [opts]
 */
export async function fetchProductsByShopId(shopId, max = 40, opts = {}) {
  if (!shopId) return [];

  const id = String(shopId);
  const includeHidden = Boolean(opts.includeHidden);
  const fieldCandidates = ["shopId", "shop_id", "vendorId", "vendor_id"];

  const keep = (p) =>
    includeHidden || !p.hidden;

  for (const field of fieldCandidates) {
    try {
      const q = query(
        collection(db, PRODUCTS_COLLECTION),
        where(field, "==", id),
        limit(max)
      );
      const snapshot = await getDocs(q);
      if (snapshot.empty) continue;
      return snapshot.docs
        .map((docSnap) =>
          mapProductRecord({ id: docSnap.id, ...docSnap.data() }, docSnap.id)
        )
        .filter(keep);
    } catch {
      /* missing index or field — try next */
    }
  }

  // Fallback: scan recent products and filter client-side (MVP until indexes exist)
  const snapshot = await getDocs(
    query(
      collection(db, PRODUCTS_COLLECTION),
      orderBy("created_at", "desc"),
      limit(100)
    )
  );
  return snapshot.docs
    .map((docSnap) =>
      mapProductRecord({ id: docSnap.id, ...docSnap.data() }, docSnap.id)
    )
    .filter(
      (p) =>
        keep(p) &&
        (p.shopId === id ||
          String(p.shop_id || "") === id ||
          String(p.vendorId || "") === id ||
          String(p.vendor_id || "") === id)
    )
    .slice(0, max);
}
