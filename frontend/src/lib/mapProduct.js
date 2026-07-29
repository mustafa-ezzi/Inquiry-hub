import { getPrimaryProductImageUrl } from "./productMedia";

const quoteLabel = "Get Quote";
const inquiryLabel = "Send Inquiry";
const verifiedLabel = "Verified";

/**
 * @param {unknown} price
 * @returns {number | null}
 */
export function parsePriceValue(price) {
  if (typeof price === "number" && Number.isFinite(price)) return price;
  if (typeof price !== "string") return null;
  const digits = price.replace(/[^\d.]/g, "");
  if (!digits) return null;
  const numericValue = Number(digits);
  return Number.isNaN(numericValue) ? null : numericValue;
}

/**
 * Data-driven verification — never assume verified.
 * @param {Record<string, unknown>} product
 */
export function isProductVerified(product) {
  if (!product || typeof product !== "object") return false;
  return Boolean(
    product.vendorVerified ||
      product.verified_product ||
      product.is_verified ||
      product.verified
  );
}

/**
 * Normalize category id from Firestore / legacy JSON.
 * @param {unknown} value
 * @returns {string | number | null}
 */
export function normalizeCategoryId(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const trimmed = value.trim();
    const parsed = Number(trimmed);
    return Number.isNaN(parsed) ? trimmed : parsed;
  }
  return null;
}

/**
 * Maps raw product docs (Firestore or static JSON) to UI card/detail props.
 * @param {Record<string, unknown>} product
 * @param {string} [fallbackId]
 */
export function mapProductRecord(product, fallbackId) {
  if (!product || typeof product !== "object") {
    return {
      id: fallbackId || "unknown",
      name: "Untitled product",
      inquiryLabel,
      vendorVerified: false,
      verifiedLabel: "",
    };
  }

  const rawPrice = product.price;
  const productPrice =
    typeof rawPrice === "string"
      ? rawPrice
      : typeof rawPrice === "number"
        ? String(rawPrice)
        : "";

  const isQuoteOnly =
    productPrice === quoteLabel ||
    productPrice === "" ||
    productPrice === "0" ||
    Boolean(product.isQuoteOnly);

  const location =
    (typeof product.location === "string" && product.location.trim()) ||
    (typeof product.city === "string" && product.city.trim()) ||
    (typeof product.vendorLocation === "string" &&
      product.vendorLocation.trim()) ||
    "";

  const vendorName =
    product.vendor ||
    product.vendorName ||
    product.shop_name ||
    product.shopName ||
    "Unknown vendor";

  const shopId =
    product.shopId ||
    product.shop_id ||
    product.vendorId ||
    product.vendor_id ||
    null;

  const categoryId = normalizeCategoryId(
    product.category_id ?? product.categoryId ?? product.category
  );

  const imageSrc =
    getPrimaryProductImageUrl(product) ||
    (typeof product.imageSrc === "string" ? product.imageSrc : "") ||
    "";

  const vendorVerified = isProductVerified(product);

  return {
    ...product,
    id: product.id || fallbackId,
    categoryId,
    category_id: categoryId,
    location,
    isQuoteOnly,
    numericPrice: isQuoteOnly ? null : parsePriceValue(productPrice),
    imageSrc,
    imageAlt: product.name || "Product image",
    name: product.name || "Untitled product",
    price: isQuoteOnly ? "" : productPrice,
    quoteLabel,
    vendorName: String(vendorName),
    vendorLocation: location,
    shopId: shopId != null ? String(shopId) : null,
    vendorVerified,
    verifiedLabel: vendorVerified ? verifiedLabel : "",
    inquiryLabel,
  };
}
