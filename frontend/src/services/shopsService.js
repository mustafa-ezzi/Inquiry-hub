import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";

export const SHOPS_COLLECTION = "shops";

/** Maps Firestore document to props expected by VendorCard / ShopPage */
export function mapShopForCard(id, data = {}) {
  const shopName = data.shopName || data.shop_name || data.name || "Shop";
  const locationRaw = data.location || data.city || "";
  const isVerified = Boolean(data.isVerified ?? data.verified);
  return {
    id,
    shopName,
    location:
      typeof locationRaw === "string" && locationRaw.trim()
        ? locationRaw.trim()
        : "—",
    isVerified,
    verifiedLabel: isVerified ? "Verified" : "",
    viewShopLabel: "View shop",
  };
}

export async function fetchShops(max = 30) {
  const q = query(
    collection(db, SHOPS_COLLECTION),
    orderBy("created_at", "desc"),
    limit(max)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) =>
    mapShopForCard(docSnap.id, docSnap.data())
  );
}

/**
 * @param {string} shopId
 * @returns {Promise<ReturnType<typeof mapShopForCard> | null>}
 */
export async function fetchShopById(shopId) {
  if (!shopId) return null;
  const snap = await getDoc(doc(db, SHOPS_COLLECTION, shopId));
  if (!snap.exists()) return null;
  return mapShopForCard(snap.id, snap.data());
}

export async function createShop({ shopName, location, ownerUid }) {
  if (!ownerUid) {
    throw new Error("Sign in required to create a shop.");
  }
  const ref = await addDoc(collection(db, SHOPS_COLLECTION), {
    shopName: shopName.trim(),
    location: location.trim(),
    verified: false,
    ownerUid,
    memberUids: [ownerUid],
    created_at: serverTimestamp(),
  });
  return { id: ref.id };
}

/**
 * @param {string} shopId
 * @param {{ shopName?: string, location?: string }} patch
 */
export async function updateShop(shopId, patch) {
  if (!shopId) throw new Error("Missing shop id.");
  const next = { updated_at: serverTimestamp() };
  if (typeof patch.shopName === "string") {
    next.shopName = patch.shopName.trim();
  }
  if (typeof patch.location === "string") {
    next.location = patch.location.trim();
  }
  await updateDoc(doc(db, SHOPS_COLLECTION, shopId), next);
}
