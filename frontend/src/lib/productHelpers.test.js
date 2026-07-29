import { describe, expect, it } from "vitest";
import { getPrimaryProductImageUrl } from "./productMedia";
import { productMatchesCategory } from "./productCategory";

describe("getPrimaryProductImageUrl", () => {
  it("reads image_urls array and legacy fields", () => {
    expect(
      getPrimaryProductImageUrl({ image_urls: ["https://cdn/a.jpg"] })
    ).toBe("https://cdn/a.jpg");
    expect(getPrimaryProductImageUrl({ image: "https://cdn/b.jpg" })).toBe(
      "https://cdn/b.jpg"
    );
    expect(getPrimaryProductImageUrl({})).toBe("");
  });

  it("reads object map image_urls", () => {
    expect(
      getPrimaryProductImageUrl({
        image_urls: { 0: { url: "https://cdn/c.jpg" } },
      })
    ).toBe("https://cdn/c.jpg");
  });
});

describe("productMatchesCategory", () => {
  const categories = [{ id: "cat-steel", legacyId: 12 }];

  it("matches by category id and legacy id", () => {
    expect(productMatchesCategory({}, null, categories)).toBe(true);
    expect(
      productMatchesCategory(
        { categoryId: "cat-steel" },
        "cat-steel",
        categories
      )
    ).toBe(true);
    expect(
      productMatchesCategory({ category_id: 12 }, "cat-steel", categories)
    ).toBe(true);
    expect(
      productMatchesCategory({ categoryId: "other" }, "cat-steel", categories)
    ).toBe(false);
  });
});
