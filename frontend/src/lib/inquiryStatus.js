/** Inquiry thread status model (Phase 3). */

export const INQUIRY_STATUS = Object.freeze({
  OPEN: "open",
  AWAITING_VENDOR: "awaiting_vendor",
  AWAITING_BUYER: "awaiting_buyer",
  CLOSED: "closed",
  WON: "won",
  LOST: "lost",
});

export const INQUIRY_STATUS_VALUES = Object.freeze(
  Object.values(INQUIRY_STATUS)
);

/**
 * @param {unknown} status
 */
export function isValidInquiryStatus(status) {
  return INQUIRY_STATUS_VALUES.includes(status);
}

/**
 * Next status after a message from `role`.
 * @param {"buyer" | "vendor"} role
 */
export function statusAfterMessage(role) {
  return role === "vendor"
    ? INQUIRY_STATUS.AWAITING_BUYER
    : INQUIRY_STATUS.AWAITING_VENDOR;
}
