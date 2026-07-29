/** Role model for InquireHub (users/{uid}.role). Email/password Auth is primary for Phase 2. */

export const ROLES = Object.freeze({
  BUYER: "buyer",
  VENDOR: "vendor",
  ADMIN: "admin",
});

export const SHOP_MEMBER_ROLES = Object.freeze({
  OWNER: "owner",
  MEMBER: "member",
});

/**
 * @param {unknown} role
 * @returns {role is typeof ROLES[keyof typeof ROLES]}
 */
export function isValidRole(role) {
  return (
    role === ROLES.BUYER || role === ROLES.VENDOR || role === ROLES.ADMIN
  );
}

/**
 * @param {string | null | undefined} role
 */
export function isAdmin(role) {
  return role === ROLES.ADMIN;
}

/**
 * @param {string | null | undefined} role
 */
export function isVendor(role) {
  return role === ROLES.VENDOR || role === ROLES.ADMIN;
}

/**
 * @param {string | null | undefined} role
 * @param {string[]} [allowed]
 */
export function hasAnyRole(role, allowed = []) {
  if (!role || !allowed.length) return false;
  return allowed.includes(role);
}
