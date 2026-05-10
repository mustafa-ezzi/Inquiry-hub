import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";

export const SHOPS_COLLECTION = "shops";

/** Maps Firestore document to props expected by VendorCard */
export function mapShopForCard(id, data) {
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

export async function createShop({ shopName, location }) {
  await addDoc(collection(db, SHOPS_COLLECTION), {
    shopName: shopName.trim(),
    location: location.trim(),
    verified: false,
    created_at: serverTimestamp(),
  });
}
