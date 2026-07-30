import { describe, expect, it } from "vitest";
import {
  canAccessAdmin,
  canAccessVendorPortal,
  canCreateReport,
  canCreateShop,
  canHideProduct,
  canPatchShopFields,
  canReadCatalog,
  canReadInquiry,
  canSuspendShop,
  canUpdateShop,
  canVerifyShop,
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

  it("blocks non-admin trust field patches", () => {
    expect(canPatchShopFields(vendor, { shopName: "X" })).toBe(true);
    expect(canPatchShopFields(vendor, { verified: true })).toBe(false);
    expect(canPatchShopFields(vendor, { suspended: true })).toBe(false);
    expect(canPatchShopFields(admin, { verified: true })).toBe(true);
  });

  it("admin-only verify / suspend / hide / admin portal", () => {
    expect(canVerifyShop(vendor)).toBe(false);
    expect(canVerifyShop(admin)).toBe(true);
    expect(canSuspendShop(buyer)).toBe(false);
    expect(canSuspendShop(admin)).toBe(true);
    expect(canHideProduct(vendor)).toBe(false);
    expect(canHideProduct(admin)).toBe(true);
    expect(canAccessAdmin(vendor)).toBe(false);
    expect(canAccessAdmin(admin)).toBe(true);
  });

  it("signed-in users can create reports", () => {
    expect(canCreateReport(null)).toBe(false);
    expect(canCreateReport(buyer)).toBe(true);
  });

  it("hides catalog products from public when hidden", () => {
    expect(canReadCatalog(buyer, { hidden: true })).toBe(false);
    expect(canReadCatalog(admin, { hidden: true })).toBe(true);
    expect(canReadCatalog(buyer, { hidden: false })).toBe(true);
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
