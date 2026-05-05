import inquiryJson from "../../inquire.json";
import PlaceholderIcon from "../components/PlaceholderIcon";

const iconMap = {
  hammer: PlaceholderIcon,
  bolt: PlaceholderIcon,
  pipe: PlaceholderIcon,
  gear: PlaceholderIcon,
  shield: PlaceholderIcon,
  "hard-hat": PlaceholderIcon,
  "nut-bolt": PlaceholderIcon,
};

const quoteLabel = "Get Quote";
const inquiryLabel = "Send Inquiry";
const verifiedLabel = "Verified";
const unverifiedLabel = "Unverified";
const viewShopLabel = "View Shop";

export const inquiryData = inquiryJson;

const mapIcon = (iconKey) => iconMap[iconKey] || PlaceholderIcon;

export const categories = inquiryJson.categories.map((category) => ({
  id: category.id,
  name: category.name,
  icon: mapIcon(category.icon),
}));

export const vendors = inquiryJson.vendors.map((vendor) => ({
  id: vendor.id,
  shopName: vendor.name,
  location: vendor.location,
  isVerified: vendor.verified,
  verifiedLabel: vendor.verified ? verifiedLabel : unverifiedLabel,
  viewShopLabel,
}));

const vendorLookup = new Map(
  inquiryJson.vendors.map((vendor) => [vendor.name, vendor])
);

const vendorIdLookup = new Map(
  inquiryJson.vendors.map((vendor) => [vendor.id, vendor])
);

const parsePriceValue = (price) => {
  if (typeof price !== "string") {
    return null;
  }

  const numericValue = Number(price.replace(/[^\d]/g, ""));
  return Number.isNaN(numericValue) ? null : numericValue;
};

const normalizeCategoryId = (value) => {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsedValue = Number(value);
    return Number.isNaN(parsedValue) ? null : parsedValue;
  }

  return null;
};

const resolveVendor = (product) =>
  vendorLookup.get(product.vendor || product.vendorName) ||
  vendorIdLookup.get(product.vendor_id || product.vendorId);

const resolveProductPrice = (price) => {
  if (typeof price !== "string" || !price.trim()) {
    return "";
  }

  return price === quoteLabel ? "" : price;
};

const resolveProductLocation = (product, vendor) =>
  product.location || vendor?.location || "";

const resolveProductImage = (product) =>
  product.image || product.imageSrc || "https://via.placeholder.com/300x220?text=Product";

export const mapProductRecord = (product, fallbackId) => {
  const vendor = resolveVendor(product);
  const productPrice = typeof product.price === "string" ? product.price : "";

  return {
    id: product.id || fallbackId,
    categoryId: normalizeCategoryId(product.category_id || product.categoryId),
    location: resolveProductLocation(product, vendor),
    isQuoteOnly: productPrice === quoteLabel,
    numericPrice: productPrice === quoteLabel ? null : parsePriceValue(productPrice),
    imageSrc: resolveProductImage(product),
    imageAlt: product.name || "Product image",
    name: product.name || "Untitled product",
    price: resolveProductPrice(productPrice),
    quoteLabel,
    vendorName: product.vendor || product.vendorName || vendor?.name || "Unknown vendor",
    vendorLocation: vendor?.location || product.location || "",
    vendorVerified: Boolean(vendor?.verified || product.vendorVerified),
    verifiedLabel:
      vendor?.verified || product.vendorVerified ? verifiedLabel : "",
    inquiryLabel,
  };
};

export const fallbackProducts = inquiryJson.products.map((product) =>
  mapProductRecord(product, product.id)
);

export const siteContent = {
  brand: inquiryJson.brand,
  header: inquiryJson.header,
  hero: inquiryJson.hero,
  sections: {
    ...inquiryJson.sections,
    howItWorks: {
      ...inquiryJson.sections.howItWorks,
      items: inquiryJson.how_it_works.map((item) => ({
        id: `how-${item.step}`,
        eyebrow: `Step ${item.step}`,
        title: item.title,
        description: item.description,
        icon: mapIcon(item.icon),
      })),
    },
    whyChooseUs: {
      ...inquiryJson.sections.whyChooseUs,
      items: inquiryJson.sections.whyChooseUs.items.map((item) => ({
        ...item,
        icon: mapIcon(item.icon),
      })),
    },
  },
  footer: inquiryJson.footer,
  bottomNav: inquiryJson.bottomNav,
};
