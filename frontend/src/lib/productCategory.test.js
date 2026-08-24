import { describe, expect, it } from "vitest";
import { productMatchesCategory } from "./productCategory";

describe("productMatchesCategory", () => {
  const cats = [
    { id: "cat-pipes", name: "Pipes", legacyId: 1 },
    { id: "cat-bolts", name: "Bolts" },
  ];

  it("matches by category id", () => {
    expect(
      productMatchesCategory({ categoryId: "cat-pipes" }, "cat-pipes", cats)
    ).toBe(true);
  });

  it("matches by category name when product stores name only", () => {
    expect(
      productMatchesCategory({ category: "Pipes" }, "cat-pipes", cats)
    ).toBe(true);
  });

  it("matches legacy id", () => {
    expect(
      productMatchesCategory({ categoryId: 1 }, "cat-pipes", cats)
    ).toBe(true);
  });

  it("returns true when no filter", () => {
    expect(productMatchesCategory({ category: "X" }, null, cats)).toBe(true);
  });
});
