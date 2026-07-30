import { describe, expect, it } from "vitest";
import { LEGAL_CONTENT, LEGAL_PAGES } from "./legalContent";
import { footerLinkPath } from "./footerLinks";

describe("legalContent", () => {
  it("has privacy and terms sections", () => {
    expect(LEGAL_CONTENT["/privacy"].sections.length).toBeGreaterThan(3);
    expect(LEGAL_CONTENT["/terms"].title).toMatch(/Terms/i);
    expect(LEGAL_PAGES.some((p) => p.path === "/contact")).toBe(true);
  });

  it("maps footer labels", () => {
    expect(footerLinkPath("Privacy Policy")).toBe("/privacy");
    expect(footerLinkPath("About Us")).toBe("/about");
  });
});
