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

  it("requires category when flag set", () => {
    expect(
      validateProductForm({
        name: "Pipe",
        category: "",
        requireCategory: true,
      })
    ).toMatch(/category/i);
  });
});
