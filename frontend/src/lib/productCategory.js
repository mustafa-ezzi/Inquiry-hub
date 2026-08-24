/**
 * Match product to selected category (Firestore doc id, name, or legacy id).
 */
export function productMatchesCategory(product, activeCategoryId, categories) {
  if (
    activeCategoryId == null ||
    activeCategoryId === "" ||
    String(activeCategoryId) === ""
  ) {
    return true;
  }
  const wanted = String(activeCategoryId);
  const fromProduct = [
    product.categoryId,
    product.category_id,
    product.category,
  ].filter((c) => c != null && c !== "");

  if (fromProduct.some((c) => String(c) === wanted)) return true;

  if (!categories?.length) return false;
  const picked = categories.find((c) => String(c.id) === wanted);
  if (!picked) return false;

  if (
    picked.name &&
    fromProduct.some(
      (c) =>
        String(c).toLowerCase() === String(picked.name).toLowerCase()
    )
  ) {
    return true;
  }

  if (picked.legacyId == null) return false;
  const leg = String(picked.legacyId);
  return fromProduct.some((c) => String(c) === leg);
}
