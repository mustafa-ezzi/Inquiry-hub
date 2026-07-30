import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { mapProductRecord } from "../lib/mapProduct";
import { validateProductForm } from "../lib/productFormValidation";
import { PRODUCTS_COLLECTION, fetchProductsByShopId } from "./productService";

/**
 * @param {string} shopId
 */
export async function listVendorProducts(shopId) {
  return fetchProductsByShopId(shopId, 80, { includeHidden: true });
}

/**
 * Create a product owned by a shop.
 */
export async function createVendorProduct({
  shopId,
  ownerUid,
  name,
  price = "",
  description = "",
  category = "",
  imageUrl = "",
  location = "",
}) {
  if (!shopId || !ownerUid) {
    throw new Error("Shop and owner are required.");
  }
  const err = validateProductForm({
    name,
    price,
    description,
    category,
    imageUrl,
  });
  if (err) throw new Error(err);

  const priceStr = String(price || "").trim();
  const image = (imageUrl || "").trim();
  const ref = await addDoc(collection(db, PRODUCTS_COLLECTION), {
    name: name.trim(),
    price: priceStr || "Get Quote",
    description: (description || "").trim(),
    category: (category || "").trim(),
    shopId,
    shop_id: shopId,
    ownerUid,
    location: (location || "").trim(),
    image_urls: image ? [image] : [],
    status: "active",
    created_at: serverTimestamp(),
  });
  return { id: ref.id };
}

/**
 * @param {string} productId
 * @param {Record<string, unknown>} patch
 */
export async function updateVendorProduct(productId, patch) {
  if (!productId) throw new Error("Missing product id.");
  const err = validateProductForm({
    name: patch.name,
    price: patch.price,
    description: patch.description,
    category: patch.category,
    imageUrl: patch.imageUrl,
  });
  if (err) throw new Error(err);

  const image = (patch.imageUrl || "").trim();
  await updateDoc(doc(db, PRODUCTS_COLLECTION, productId), {
    name: String(patch.name || "").trim(),
    price: String(patch.price || "").trim() || "Get Quote",
    description: String(patch.description || "").trim(),
    category: String(patch.category || "").trim(),
    location: String(patch.location || "").trim(),
    image_urls: image ? [image] : [],
    updated_at: serverTimestamp(),
  });
}

export async function deleteVendorProduct(productId) {
  if (!productId) throw new Error("Missing product id.");
  await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId));
}

export async function getVendorProduct(productId) {
  if (!productId) return null;
  const snap = await getDoc(doc(db, PRODUCTS_COLLECTION, productId));
  if (!snap.exists()) return null;
  return mapProductRecord({ id: snap.id, ...snap.data() }, snap.id);
}
