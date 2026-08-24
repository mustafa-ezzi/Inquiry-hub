/** Vendor / admin product form validation. */

export function validateProductForm({
  name,
  price,
  description,
  category,
  imageUrl,
  requireCategory = false,
}) {
  const n = typeof name === "string" ? name.trim() : "";
  if (n.length < 2 || n.length > 160) {
    return "Product name must be 2–160 characters.";
  }
  const desc = typeof description === "string" ? description.trim() : "";
  if (desc.length > 2000) {
    return "Description must be at most 2000 characters.";
  }
  const cat = typeof category === "string" ? category.trim() : "";
  if (requireCategory && !cat) {
    return "Please select a category.";
  }
  if (cat.length > 80) {
    return "Category is too long.";
  }
  if (imageUrl && typeof imageUrl === "string") {
    const u = imageUrl.trim();
    if (u && !/^https?:\/\//i.test(u)) {
      return "Image URL must start with http:// or https://";
    }
  }
  if (price != null && price !== "") {
    const p = String(price).trim();
    if (p && p !== "Get Quote") {
      const digits = p.replace(/[^\d.]/g, "");
      if (!digits || Number.isNaN(Number(digits))) {
        return "Price must be a number or leave blank for quote-only.";
      }
    }
  }
  return null;
}
