import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { mapProductRecord } from "../lib/mapProduct";
import { attachShopMembership } from "./authService";
import { setProductHidden } from "./moderationService";
import { PRODUCTS_COLLECTION } from "./productService";
import { fetchShopById, SHOPS_COLLECTION } from "./shopsService";
import { createVendorProduct } from "./vendorProductService";

export const ANTARIA_STEELS_SHOP_ID = "nJOJGDZfrGjFOmuTnlbW";

/**
 * Admin product list (includes hidden).
 * @param {number} [max]
 */
export async function listProductsAdmin(max = 80) {
  const q = query(
    collection(db, PRODUCTS_COLLECTION),
    orderBy("created_at", "desc"),
    limit(max)
  );
  try {
    const snap = await getDocs(q);
    return snap.docs.map((d) =>
      mapProductRecord({ id: d.id, ...d.data() }, d.id)
    );
  } catch {
    const snap = await getDocs(
      query(collection(db, PRODUCTS_COLLECTION), limit(max))
    );
    return snap.docs.map((d) =>
      mapProductRecord({ id: d.id, ...d.data() }, d.id)
    );
  }
}

/**
 * Create product as admin (any shop).
 */
export async function createProductAdmin(payload) {
  return createVendorProduct(payload);
}

/**
 * Assign products to a shop and denormalize vendor/shop names.
 * @param {string} shopId
 * @param {{ onlyMissingShop?: boolean }} [opts]
 * @returns {Promise<{ updated: number, shopName: string }>}
 */
export async function associateProductsWithShop(shopId, opts = {}) {
  if (!shopId) throw new Error("Shop id required.");
  const shop = await fetchShopById(shopId);
  if (!shop) throw new Error("Shop not found.");
  const shopName = shop.shopName || "Shop";
  const location =
    shop.location && shop.location !== "—" ? shop.location : "";

  const snap = await getDocs(
    query(collection(db, PRODUCTS_COLLECTION), limit(400))
  );

  let updated = 0;
  let batch = writeBatch(db);
  let ops = 0;

  const flush = async () => {
    if (ops === 0) return;
    await batch.commit();
    batch = writeBatch(db);
    ops = 0;
  };

  for (const d of snap.docs) {
    const data = d.data() || {};
    const currentShop = String(
      data.shopId || data.shop_id || data.vendorId || data.vendor_id || ""
    );
    if (opts.onlyMissingShop && currentShop) continue;

    batch.update(d.ref, {
      shopId,
      shop_id: shopId,
      shopName,
      vendorName: shopName,
      vendor: shopName,
      location: data.location || location,
      updated_at: serverTimestamp(),
    });
    updated += 1;
    ops += 1;
    if (ops >= 400) await flush();
  }
  await flush();
  return { updated, shopName };
}

/**
 * Backfill vendorName/shopName for products that already belong to a shop.
 * @param {string} shopId
 */
export async function backfillProductVendorNames(shopId) {
  if (!shopId) throw new Error("Shop id required.");
  const shop = await fetchShopById(shopId);
  if (!shop) throw new Error("Shop not found.");
  const shopName = shop.shopName || "Shop";
  const location =
    shop.location && shop.location !== "—" ? shop.location : "";

  const snap = await getDocs(
    query(collection(db, PRODUCTS_COLLECTION), limit(400))
  );
  let updated = 0;
  let batch = writeBatch(db);
  let ops = 0;
  const flush = async () => {
    if (!ops) return;
    await batch.commit();
    batch = writeBatch(db);
    ops = 0;
  };

  for (const d of snap.docs) {
    const data = d.data() || {};
    const pid = String(data.shopId || data.shop_id || "");
    if (pid !== shopId) continue;
    batch.update(d.ref, {
      shopId,
      shop_id: shopId,
      shopName,
      vendorName: shopName,
      vendor: shopName,
      location: data.location || location,
      updated_at: serverTimestamp(),
    });
    updated += 1;
    ops += 1;
    if (ops >= 400) await flush();
  }
  await flush();
  return { updated, shopName };
}

/**
 * Link a user as shop owner + membership.
 * @param {string} shopId
 * @param {string} ownerUid
 */
export async function linkShopOwner(shopId, ownerUid) {
  if (!shopId || !ownerUid) throw new Error("Shop and user are required.");
  const shopRef = doc(db, SHOPS_COLLECTION, shopId);
  const raw = await getDoc(shopRef);
  if (!raw.exists()) throw new Error("Shop not found.");

  const data = raw.data() || {};
  const memberUids = Array.isArray(data.memberUids) ? [...data.memberUids] : [];
  if (!memberUids.includes(ownerUid)) memberUids.push(ownerUid);

  await updateDoc(shopRef, {
    ownerUid,
    memberUids,
    updated_at: serverTimestamp(),
  });
  await attachShopMembership(ownerUid, shopId);
  return { shopId, ownerUid, memberUids };
}

export { setProductHidden, createVendorProduct };
