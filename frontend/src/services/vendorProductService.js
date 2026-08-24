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
import { fetchShopById } from "./shopsService";

/**
 * @param {string} shopId
 */
export async function listVendorProducts(shopId) {
  return fetchProductsByShopId(shopId, 80, { includeHidden: true });
}

/**
 * Create a product owned by a shop (denormalizes shop name for catalog cards).
 */
export async function createVendorProduct({
  shopId,
  ownerUid,
  name,
  price = "",
  description = "",
  category = "",
  categoryId = "",
  imageUrl = "",
  location = "",
  vendorName = "",
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
    requireCategory: true,
  });
  if (err) throw new Error(err);

  const shop = await fetchShopById(shopId);
  const shopName =
    vendorName.trim() ||
    shop?.shopName ||
    "Shop";
  const loc =
    (location || "").trim() ||
    (shop?.location && shop.location !== "—" ? shop.location : "");

  const priceStr = String(price || "").trim();
  const image = (imageUrl || "").trim();
  const catName = (category || "").trim();
  const catId = (categoryId || "").trim();

  const ref = await addDoc(collection(db, PRODUCTS_COLLECTION), {
    name: name.trim(),
    price: priceStr || "Get Quote",
    description: (description || "").trim(),
    category: catName,
    categoryId: catId || catName,
    category_id: catId || catName,
    shopId,
    shop_id: shopId,
    shopName,
    vendorName: shopName,
    vendor: shopName,
    ownerUid,
    location: loc,
    image_urls: image ? [image] : [],
    status: "active",
    hidden: false,
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
    requireCategory: true,
  });
  if (err) throw new Error(err);

  const image = (patch.imageUrl || "").trim();
  const catName = String(patch.category || "").trim();
  const catId = String(patch.categoryId || "").trim();
  const payload = {
    name: String(patch.name || "").trim(),
    price: String(patch.price || "").trim() || "Get Quote",
    description: String(patch.description || "").trim(),
    category: catName,
    categoryId: catId || catName,
    category_id: catId || catName,
    location: String(patch.location || "").trim(),
    image_urls: image ? [image] : [],
    updated_at: serverTimestamp(),
  };
  if (patch.vendorName) {
    payload.vendorName = String(patch.vendorName).trim();
    payload.shopName = payload.vendorName;
    payload.vendor = payload.vendorName;
  }
  await updateDoc(doc(db, PRODUCTS_COLLECTION, productId), payload);
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
