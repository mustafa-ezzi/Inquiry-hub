import {
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { storage } from "../lib/firebase";
import { validateProductImageFile } from "../lib/productImageValidation";

/**
 * Upload a product image for a shop; returns a public download URL.
 * @param {{ shopId: string, file: File, productId?: string }} args
 * @returns {Promise<string>}
 */
export async function uploadProductImage({ shopId, file, productId = "" }) {
  if (!shopId) throw new Error("Shop is required to upload an image.");
  const err = validateProductImageFile(file);
  if (err) throw new Error(err);

  const ext =
    (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") ||
    "jpg";
  const safeId = productId || `new_${Date.now()}`;
  const path = `product-images/${shopId}/${safeId}_${Date.now()}.${ext}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file, {
    contentType: file.type || "image/jpeg",
    cacheControl: "public,max-age=31536000",
  });
  return getDownloadURL(storageRef);
}

export { validateProductImageFile };
