const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

/**
 * @param {File | null | undefined} file
 * @returns {string | null}
 */
export function validateProductImageFile(file) {
  if (!file) return "Please choose an image.";
  if (!ALLOWED_TYPES.has(file.type)) {
    return "Use a JPG, PNG, WebP, or GIF image.";
  }
  if (file.size > MAX_BYTES) {
    return "Image must be 5 MB or smaller.";
  }
  return null;
}

export { MAX_BYTES, ALLOWED_TYPES };
