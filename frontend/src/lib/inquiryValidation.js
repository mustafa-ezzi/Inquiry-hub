/** Basic abuse / validation controls for inquiry messages (Phase 3). */

export const MAX_MESSAGE_LENGTH = 2000;
export const MAX_NAME_LENGTH = 120;
export const MAX_PHONE_LENGTH = 20;

/**
 * Pakistan-friendly phone: digits, optional +, spaces/dashes; 10–15 digits.
 * @param {string} phone
 */
export function isValidPhone(phone) {
  if (typeof phone !== "string") return false;
  const trimmed = phone.trim();
  if (!trimmed || trimmed.length > MAX_PHONE_LENGTH) return false;
  const digits = trimmed.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

/**
 * @param {string} name
 */
export function isValidBuyerName(name) {
  if (typeof name !== "string") return false;
  const t = name.trim();
  return t.length >= 2 && t.length <= MAX_NAME_LENGTH;
}

/**
 * @param {string} body
 */
export function isValidMessageBody(body) {
  if (typeof body !== "string") return false;
  const t = body.trim();
  return t.length >= 1 && t.length <= MAX_MESSAGE_LENGTH;
}

/**
 * @param {{ buyerName: string, phone: string, message: string }} input
 * @returns {string | null} error message or null if ok
 */
export function validateInquiryOnboarding({ buyerName, phone, message }) {
  if (!isValidBuyerName(buyerName)) {
    return "Enter a valid name (2–120 characters).";
  }
  if (!isValidPhone(phone)) {
    return "Enter a valid phone number (10–15 digits).";
  }
  if (!isValidMessageBody(message)) {
    return `Message must be 1–${MAX_MESSAGE_LENGTH} characters.`;
  }
  return null;
}
