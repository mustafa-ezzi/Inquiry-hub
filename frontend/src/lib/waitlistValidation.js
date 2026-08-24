/** Vendor waitlist status helpers. */

export const WAITLIST_STATUS = Object.freeze({
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  CONTACTED: "contacted",
});

export const WAITLIST_STATUS_VALUES = Object.freeze(
  Object.values(WAITLIST_STATUS)
);

/**
 * @param {unknown} status
 */
export function isValidWaitlistStatus(status) {
  return WAITLIST_STATUS_VALUES.includes(status);
}

/**
 * @param {{ name?: string, phone?: string, shopName?: string }} fields
 * @returns {string | null}
 */
export function validateWaitlistSubmission({ name, phone, shopName }) {
  const n = typeof name === "string" ? name.trim() : "";
  const p = typeof phone === "string" ? phone.trim() : "";
  const s = typeof shopName === "string" ? shopName.trim() : "";
  if (n.length < 2) return "Please enter your name.";
  if (p.length < 8) return "Please enter a valid phone number.";
  if (s.length < 2) return "Please enter a shop name.";
  return null;
}
