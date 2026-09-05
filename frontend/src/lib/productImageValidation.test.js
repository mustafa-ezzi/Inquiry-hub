import { describe, expect, it } from "vitest";
import { validateProductImageFile } from "../lib/productImageValidation";

describe("validateProductImageFile", () => {
  it("rejects missing file", () => {
    expect(validateProductImageFile(null)).toMatch(/image/i);
  });

  it("rejects non-image types", () => {
    const file = new File(["x"], "doc.pdf", { type: "application/pdf" });
    expect(validateProductImageFile(file)).toMatch(/JPG|PNG|WebP|GIF/i);
  });

  it("accepts jpeg under limit", () => {
    const file = new File(["abc"], "photo.jpg", { type: "image/jpeg" });
    expect(validateProductImageFile(file)).toBeNull();
  });
});
