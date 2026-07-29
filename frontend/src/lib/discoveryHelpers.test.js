import { describe, expect, it, vi } from "vitest";
import { footerLinkPath } from "./footerLinks";
import { mapCategoryIcon, HammerIcon, BoltIcon } from "./categoryIcons";

vi.mock("./firebase", () => ({ db: {} }));

const { mapShopForCard } = await import("../services/shopsService");

describe("footerLinkPath", () => {
  it("maps legal labels to routes", () => {
    expect(footerLinkPath("About Us")).toBe("/about");
    expect(footerLinkPath("Privacy Policy")).toBe("/privacy");
    expect(footerLinkPath("Terms of Service")).toBe("/terms");
    expect(footerLinkPath("Contact")).toBe("/contact");
    expect(footerLinkPath("Unknown")).toBeNull();
  });
});

describe("mapCategoryIcon", () => {
  it("returns distinct icons for known keys", () => {
    expect(mapCategoryIcon("hammer")).toBe(HammerIcon);
    expect(mapCategoryIcon("bolt")).toBe(BoltIcon);
    expect(mapCategoryIcon("hammer")).not.toBe(mapCategoryIcon("bolt"));
  });
});

describe("mapShopForCard", () => {
  it("normalizes shop fields and verification", () => {
    const shop = mapShopForCard("s1", {
      shop_name: "Acme Metals",
      city: "Karachi",
      verified: true,
    });
    expect(shop).toMatchObject({
      id: "s1",
      shopName: "Acme Metals",
      location: "Karachi",
      isVerified: true,
      verifiedLabel: "Verified",
      viewShopLabel: "View shop",
    });
  });

  it("defaults unverified shops", () => {
    const shop = mapShopForCard("s2", { shopName: "Local" });
    expect(shop.isVerified).toBe(false);
    expect(shop.verifiedLabel).toBe("");
  });
});
