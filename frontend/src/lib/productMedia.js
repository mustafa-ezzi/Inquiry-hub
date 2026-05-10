/**
 * Same image sources used on listing cards (`image_urls`) and legacy fields.
 */
function firstUrlFromList(list) {
  if (!Array.isArray(list) || list.length === 0) return "";
  const first = list[0];
  if (typeof first === "string" && first.trim()) return first.trim();
  if (first && typeof first === "object") {
    const s = first.url || first.src || first.href || first.downloadURL || "";
    if (typeof s === "string" && s.trim()) return s.trim();
  }
  return "";
}

function firstUrlFromRecord(obj) {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return "";
  for (const v of Object.values(obj)) {
    if (typeof v === "string" && v.trim()) return v.trim();
    if (v && typeof v === "object") {
      const s = v.url || v.src || v.href || v.downloadURL || "";
      if (typeof s === "string" && s.trim()) return s.trim();
    }
  }
  return "";
}

export function getPrimaryProductImageUrl(product) {
  if (!product || typeof product !== "object") return "";

  const fromUrls = firstUrlFromList(product.image_urls);
  if (fromUrls) return fromUrls;

  const fromUrlsRecord = firstUrlFromRecord(product.image_urls);
  if (fromUrlsRecord) return fromUrlsRecord;

  const fromImages = firstUrlFromList(product.images);
  if (fromImages) return fromImages;

  for (const key of [
    "image",
    "imageSrc",
    "photo",
    "thumbnail",
    "picture",
    "coverImage",
  ]) {
    const v = product[key];
    if (typeof v === "string" && v.trim()) return v.trim();
  }

  return "";
}
