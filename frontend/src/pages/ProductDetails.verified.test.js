import { describe, expect, it } from "vitest";
import { isProductVerified } from "../lib/mapProduct";

describe("ProductDetails verified badge logic", () => {
  it("hides verified badge when product is not verified", () => {
    expect(isProductVerified({ name: "Pipe" })).toBe(false);
  });

  it("shows verified badge only when flags are set", () => {
    expect(isProductVerified({ vendorVerified: true })).toBe(true);
  });
});
