/**
 * Analytics facade (Phase 5–6).
 * Respects cookie consent for non-essential events.
 */

import { analyticsAllowed } from "../lib/cookieConsent";

/** @type {(name: string, params?: Record<string, unknown>) => void | Promise<void>} */
let tracker = (name, params) => {
  if (typeof console !== "undefined") {
    console.info("[analytics]", name, params || {});
  }
};

/**
 * @param {(name: string, params?: Record<string, unknown>) => void | Promise<void>} fn
 */
export function setAnalyticsTracker(fn) {
  tracker = fn;
}

export function resetAnalyticsTracker() {
  tracker = (name, params) => {
    if (typeof console !== "undefined") {
      console.info("[analytics]", name, params || {});
    }
  };
}

/**
 * @param {string} name
 * @param {Record<string, unknown>} [params]
 * @param {{ requireConsent?: boolean }} [opts]
 */
export async function trackEvent(name, params = {}, opts = {}) {
  if (!name) return;
  const requireConsent = opts.requireConsent !== false;
  if (requireConsent && !analyticsAllowed()) return;
  await tracker(name, params);
}

export const ANALYTICS_EVENTS = Object.freeze({
  INQUIRY_CREATED: "inquiry_created",
  FIRST_VENDOR_REPLY: "first_vendor_reply",
  REPORT_CREATED: "report_created",
  SHOP_VERIFIED: "shop_verified",
  SHOP_SUSPENDED: "shop_suspended",
});
