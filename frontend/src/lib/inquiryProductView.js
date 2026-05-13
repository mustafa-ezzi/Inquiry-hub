import { getPrimaryProductImageUrl } from "./productMedia";
import { measurementTextToDisplay } from "./productMeasurements";

export function buildInquiryProductView(product) {
  if (!product) return null;
  const vendorName =
    product.vendorName ||
    product.vendor ||
    product.shop_name ||
    "Vendor";
  const location =
    product.vendorLocation ||
    product.location ||
    product.city ||
    "";
  const name = product.name || "Product";
  const imageUrl = getPrimaryProductImageUrl(product);
  const specLine =
    measurementTextToDisplay(product.measurements) ||
    measurementTextToDisplay(product.description) ||
    "";
  const rawPrice = product.price;
  const isQuoteOnly =
    product.isQuoteOnly ||
    !rawPrice ||
    rawPrice === "Get Quote" ||
    rawPrice === "0" ||
    rawPrice === 0;
  const priceLabel =
    typeof rawPrice === "string" && rawPrice.trim() ? rawPrice.trim() : "";
  const verified =
    Boolean(product.vendorVerified) ||
    Boolean(product.verified_product) ||
    Boolean(product.is_verified);

  return {
    vendorName,
    location: location || "—",
    name,
    imageUrl,
    specLine,
    isQuoteOnly,
    priceLabel,
    verified,
  };
}
