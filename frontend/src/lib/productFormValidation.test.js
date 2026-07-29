import { describe, expect, it } from "vitest";
import { validateProductForm } from "./productFormValidation";

describe("validateProductForm", () => {
  it("accepts a minimal valid product", () => {
    expect(
      validateProductForm({
        name: "MS Pipe",
        price: "",
        description: "Grade A",
        category: "Pipes",
        imageUrl: "",
      })
    ).toBeNull();
  });

  it("rejects short names and bad image URLs", () => {
    expect(validateProductForm({ name: "A" })).toMatch(/2–160/);
    expect(
      validateProductForm({
        name: "Pipe",
        imageUrl: "ftp://bad",
      })
    ).toMatch(/http/i);
  });

  it("rejects non-numeric price when provided", () => {
    expect(
      validateProductForm({ name: "Pipe", price: "abc" })
    ).toMatch(/number/i);
  });
});
