/**
 * Pure access-control helpers mirroring `firestore.rules`.
 * Used for unit tests and client-side UX gating (rules still enforce on server).
 */

import { isAdmin, isVendor, ROLES, SHOP_MEMBER_ROLES } from "./roles";

/**
 * @typedef {{ uid: string | null, role?: string | null, shopIds?: string[] }} AuthContext
 */

/** Trust fields only admins may change on shops (responseMetrics may be written by shop members). */
export const SHOP_TRUST_FIELDS = Object.freeze([
  "verified",
  "suspended",
  "suspendedReason",
]);

/**
 * @param {AuthContext | null | undefined} auth
 */
export function isSignedIn(auth) {
  return Boolean(auth?.uid);
}

/**
 * Public catalog reads (products, categories, shops list/detail).
 * Hidden products are not public (client filter + rules).
 * @param {AuthContext | null | undefined} auth
 * @param {{ hidden?: boolean } | null | undefined} [product]
 */
export function canReadCatalog(auth, product) {
  if (product?.hidden) return isAdmin(auth?.role);
  return true;
}

/**
 * Creating a shop requires a signed-in user (becomes owner + vendor).
 * @param {AuthContext | null | undefined} auth
 */
export function canCreateShop(auth) {
  return isSignedIn(auth);
}

/**
 * Profile fields (name/location) for shop members; admins always.
 * @param {AuthContext | null | undefined} auth
 * @param {{ ownerUid?: string, memberUids?: string[], id?: string } | null | undefined} shop
 */
export function canUpdateShop(auth, shop) {
  if (!isSignedIn(auth) || !shop) return false;
  if (isAdmin(auth.role)) return true;
  if (shop.ownerUid && shop.ownerUid === auth.uid) return true;
  if (Array.isArray(shop.memberUids) && shop.memberUids.includes(auth.uid)) {
    return true;
  }
  if (Array.isArray(auth.shopIds) && shop.id && auth.shopIds.includes(shop.id)) {
    return true;
  }
  return false;
}

/**
 * Non-admins cannot change trust/ops fields on a shop patch.
 * @param {AuthContext | null | undefined} auth
 * @param {Record<string, unknown> | null | undefined} patch
 */
export function canPatchShopFields(auth, patch) {
  if (!isSignedIn(auth) || !patch) return false;
  if (isAdmin(auth.role)) return true;
  return !SHOP_TRUST_FIELDS.some((key) =>
    Object.prototype.hasOwnProperty.call(patch, key)
  );
}

/**
 * @param {AuthContext | null | undefined} auth
 */
export function canVerifyShop(auth) {
  return isSignedIn(auth) && isAdmin(auth.role);
}

/**
 * @param {AuthContext | null | undefined} auth
 */
export function canSuspendShop(auth) {
  return isSignedIn(auth) && isAdmin(auth.role);
}

/**
 * @param {AuthContext | null | undefined} auth
 */
export function canHideProduct(auth) {
  return isSignedIn(auth) && isAdmin(auth.role);
}

/**
 * @param {AuthContext | null | undefined} auth
 */
export function canAccessAdmin(auth) {
  return isSignedIn(auth) && isAdmin(auth.role);
}

/**
 * @param {AuthContext | null | undefined} auth
 */
export function canCreateReport(auth) {
  return isSignedIn(auth);
}

/**
 * Products: anyone can read non-hidden; create/update only shop members / admin.
 * @param {AuthContext | null | undefined} auth
 * @param {{ shopId?: string, ownerUid?: string, hidden?: boolean } | null | undefined} product
 */
export function canWriteProduct(auth, product) {
  if (!isSignedIn(auth)) return false;
  if (isAdmin(auth.role)) return true;
  if (!isVendor(auth.role)) return false;
  const shopId = product?.shopId;
  if (shopId && Array.isArray(auth.shopIds) && auth.shopIds.includes(shopId)) {
    return true;
  }
  if (product?.ownerUid && product.ownerUid === auth.uid) return true;
  return false;
}

/**
 * Private inquiry threads.
 * @param {AuthContext | null | undefined} auth
 * @param {{ buyerUid?: string, shopId?: string } | null | undefined} inquiry
 */
export function canReadInquiry(auth, inquiry) {
  if (!isSignedIn(auth) || !inquiry) return false;
  if (isAdmin(auth.role)) return true;
  if (inquiry.buyerUid && inquiry.buyerUid === auth.uid) return true;
  if (
    inquiry.shopId &&
    Array.isArray(auth.shopIds) &&
    auth.shopIds.includes(inquiry.shopId)
  ) {
    return true;
  }
  return false;
}

/**
 * @param {AuthContext | null | undefined} auth
 * @param {{ buyerUid?: string } | null | undefined} inquiry
 */
export function canCreateInquiryMessage(auth, inquiry) {
  return canReadInquiry(auth, inquiry);
}

/**
 * @param {AuthContext | null | undefined} auth
 * @param {string} profileUid
 */
export function canReadUserProfile(auth, profileUid) {
  if (!isSignedIn(auth)) return false;
  if (isAdmin(auth.role)) return true;
  return auth.uid === profileUid;
}

/**
 * @param {AuthContext | null | undefined} auth
 * @param {string} profileUid
 * @param {{ role?: string } | null | undefined} [incoming]
 */
export function canWriteUserProfile(auth, profileUid, incoming) {
  if (!isSignedIn(auth)) return false;
  if (isAdmin(auth.role)) return true;
  if (auth.uid !== profileUid) return false;
  if (incoming?.role === ROLES.ADMIN && auth.role !== ROLES.ADMIN) return false;
  return true;
}

/**
 * Vendor portal route gate.
 * @param {AuthContext | null | undefined} auth
 */
export function canAccessVendorPortal(auth) {
  return isSignedIn(auth) && isVendor(auth.role);
}

export { ROLES, SHOP_MEMBER_ROLES };
