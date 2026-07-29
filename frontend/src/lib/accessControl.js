/**
 * Pure access-control helpers mirroring `firestore.rules`.
 * Used for unit tests and client-side UX gating (rules still enforce on server).
 */

import { isAdmin, isVendor, ROLES, SHOP_MEMBER_ROLES } from "./roles";

/**
 * @typedef {{ uid: string | null, role?: string | null, shopIds?: string[] }} AuthContext
 */

/**
 * @param {AuthContext | null | undefined} auth
 */
export function isSignedIn(auth) {
  return Boolean(auth?.uid);
}

/**
 * Public catalog reads (products, categories, shops list/detail).
 */
export function canReadCatalog(_auth) {
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
 * @param {AuthContext | null | undefined} auth
 * @param {{ ownerUid?: string, memberUids?: string[] } | null | undefined} shop
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
 * Products: anyone can read; create/update only shop members / admin.
 * @param {AuthContext | null | undefined} auth
 * @param {{ shopId?: string, ownerUid?: string } | null | undefined} product
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
 * Private inquiry threads (future Firestore collection `inquiries`).
 * Unauthenticated cannot read. Buyer owner or vendor of related shop / admin.
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
 * Users may read/write their own profile doc; admin can read all.
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
  // Clients cannot escalate to admin
  if (incoming?.role === ROLES.ADMIN && auth.role !== ROLES.ADMIN) return false;
  return true;
}

/**
 * Vendor portal route gate (Phase 4 UI; prepared here).
 * @param {AuthContext | null | undefined} auth
 */
export function canAccessVendorPortal(auth) {
  return isSignedIn(auth) && isVendor(auth.role);
}

export { ROLES, SHOP_MEMBER_ROLES };
