import { describe, expect, it } from "vitest";
import {
  canAccessVendorPortal,
  canCreateShop,
  canReadInquiry,
  canUpdateShop,
  canWriteProduct,
  canWriteUserProfile,
} from "./accessControl";
import { ROLES } from "./roles";

describe("accessControl (mirrors firestore.rules)", () => {
  const buyer = { uid: "b1", role: ROLES.BUYER, shopIds: [] };
  const vendor = { uid: "v1", role: ROLES.VENDOR, shopIds: ["shop-1"] };
  const admin = { uid: "a1", role: ROLES.ADMIN, shopIds: [] };

  it("blocks unauthenticated shop create and inquiry reads", () => {
    expect(canCreateShop(null)).toBe(false);
    expect(canReadInquiry(null, { buyerUid: "b1" })).toBe(false);
  });

  it("allows signed-in users to create shops", () => {
    expect(canCreateShop(buyer)).toBe(true);
  });

  it("enforces shop update membership", () => {
    const shop = { id: "shop-1", ownerUid: "v1", memberUids: ["v1"] };
    expect(canUpdateShop(buyer, shop)).toBe(false);
    expect(canUpdateShop(vendor, shop)).toBe(true);
    expect(canUpdateShop(admin, shop)).toBe(true);
    expect(canUpdateShop(buyer, { ownerUid: "b1" })).toBe(true);
  });

  it("enforces product writes for vendors of that shop", () => {
    expect(canWriteProduct(buyer, { shopId: "shop-1" })).toBe(false);
    expect(canWriteProduct(vendor, { shopId: "shop-1" })).toBe(true);
    expect(canWriteProduct(vendor, { shopId: "other" })).toBe(false);
  });

  it("allows inquiry read only for buyer, shop vendor, or admin", () => {
    const inquiry = { buyerUid: "b1", shopId: "shop-1" };
    expect(canReadInquiry(buyer, inquiry)).toBe(true);
    expect(canReadInquiry(vendor, inquiry)).toBe(true);
    expect(canReadInquiry({ uid: "x", role: ROLES.BUYER, shopIds: [] }, inquiry)).toBe(
      false
    );
    expect(canReadInquiry(admin, inquiry)).toBe(true);
  });

  it("prevents client role escalation to admin", () => {
    expect(canWriteUserProfile(buyer, "b1", { role: ROLES.ADMIN })).toBe(false);
    expect(canWriteUserProfile(buyer, "b1", { role: ROLES.VENDOR })).toBe(true);
    expect(canWriteUserProfile(buyer, "other", {})).toBe(false);
  });

  it("gates vendor portal", () => {
    expect(canAccessVendorPortal(buyer)).toBe(false);
    expect(canAccessVendorPortal(vendor)).toBe(true);
    expect(canAccessVendorPortal(admin)).toBe(true);
  });
});
