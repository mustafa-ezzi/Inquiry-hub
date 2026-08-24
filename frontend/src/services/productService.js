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
import { fetchShopById } from "./shopsService";

export const PRODUCTS_COLLECTION = "products";

/**
 * Resolve missing vendorName from shop docs.
 * @param {ReturnType<typeof mapProductRecord>[]} products
 */
export async function enrichProductsWithShops(products) {
  if (!products?.length) return products || [];
  const need = products.filter(
    (p) =>
      p.shopId &&
      (!p.vendorName ||
        p.vendorName === "Unknown vendor" ||
        p.vendorName === "Shop")
  );
  if (!need.length) return products;

  const cache = new Map();
  await Promise.all(
    [...new Set(need.map((p) => p.shopId).filter(Boolean))].map(async (id) => {
      try {
        cache.set(id, await fetchShopById(id));
      } catch {
        cache.set(id, null);
      }
    })
  );

  return products.map((p) => {
    if (!p.shopId) return p;
    if (p.vendorName && p.vendorName !== "Unknown vendor") return p;
    const shop = cache.get(p.shopId);
    if (!shop?.shopName) return p;
    return {
      ...p,
      vendorName: shop.shopName,
      vendorLocation: p.location || shop.location || "",
      location: p.location || (shop.location !== "—" ? shop.location : ""),
    };
  });
}

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

  const products = snapshot.docs
    .map((docSnap) =>
      mapProductRecord({ id: docSnap.id, ...docSnap.data() }, docSnap.id)
    )
    .filter((p) => !p.hidden);

  return {
    products: await enrichProductsWithShops(products),
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
      const rows = snapshot.docs
        .map((docSnap) =>
          mapProductRecord({ id: docSnap.id, ...docSnap.data() }, docSnap.id)
        )
        .filter(keep);
      return enrichProductsWithShops(rows);
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
  const rows = snapshot.docs
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
  return enrichProductsWithShops(rows);
}
