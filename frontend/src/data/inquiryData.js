import inquiryJson from "../../inquire.json";
import { mapCategoryIcon } from "../lib/categoryIcons";
import { mapProductRecord as mapProductCore } from "../lib/mapProduct";

const mapIcon = (iconKey) => mapCategoryIcon(iconKey);

const verifiedLabel = "Verified";
const unverifiedLabel = "Unverified";
const viewShopLabel = "View Shop";

export const inquiryData = inquiryJson;

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

const resolveVendor = (product) =>
  vendorLookup.get(product.vendor || product.vendorName) ||
  vendorIdLookup.get(product.vendor_id || product.vendorId);

/** Static catalog mapper — enriches JSON products with vendor verification. */
export const mapProductRecord = (product, fallbackId) => {
  const vendor = resolveVendor(product);
  return mapProductCore(
    {
      ...product,
      vendorVerified: Boolean(vendor?.verified || product.vendorVerified),
      location: product.location || vendor?.location || "",
      vendorName: product.vendor || product.vendorName || vendor?.name,
    },
    fallbackId
  );
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
