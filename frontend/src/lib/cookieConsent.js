/** Cookie / analytics consent helpers (Phase 6). */

export const COOKIE_CONSENT_KEY = "ih_cookie_consent";

/** @typedef {"accepted" | "declined"} CookieConsentValue */

/**
 * @returns {CookieConsentValue | null}
 */
export function readCookieConsent() {
  try {
    const v = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (v === "accepted" || v === "declined") return v;
  } catch {
    /* ignore */
  }
  return null;
}

/**
 * @param {CookieConsentValue} value
 */
export function writeCookieConsent(value) {
  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, value);
  } catch {
    /* ignore */
  }
}

export function analyticsAllowed() {
  return readCookieConsent() === "accepted";
}
