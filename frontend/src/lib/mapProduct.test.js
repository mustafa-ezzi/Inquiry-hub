import { describe, expect, it } from "vitest";
import {
  isProductVerified,
  mapProductRecord,
  parsePriceValue,
} from "../lib/mapProduct";

describe("mapProduct", () => {
  it("parses numeric prices from currency strings", () => {
    expect(parsePriceValue("PKR 12,500")).toBe(12500);
    expect(parsePriceValue(99)).toBe(99);
    expect(parsePriceValue("Get Quote")).toBeNull();
  });

  it("treats verification as data-driven (never default true)", () => {
    expect(isProductVerified({})).toBe(false);
    expect(isProductVerified({ vendorVerified: true })).toBe(true);
    expect(isProductVerified({ verified_product: true })).toBe(true);
    expect(isProductVerified({ is_verified: true })).toBe(true);
  });

  it("maps Firestore-shaped products for cards", () => {
    const mapped = mapProductRecord(
      {
        id: "p1",
        name: "Steel Pipe",
        price: "15000",
        location: "Lahore",
        shop_id: "shop-9",
        vendorName: "Metal Co",
        vendorVerified: true,
        category_id: "cat-1",
      },
      "p1"
    );

    expect(mapped.name).toBe("Steel Pipe");
    expect(mapped.numericPrice).toBe(15000);
    expect(mapped.shopId).toBe("shop-9");
    expect(mapped.vendorVerified).toBe(true);
    expect(mapped.verifiedLabel).toBe("Verified");
    expect(mapped.inquiryLabel).toBe("Send Inquiry");
  });

  it("marks quote-only products without a price", () => {
    const mapped = mapProductRecord({ name: "Custom cut", price: "Get Quote" });
    expect(mapped.isQuoteOnly).toBe(true);
    expect(mapped.price).toBe("");
    expect(mapped.numericPrice).toBeNull();
  });
});
