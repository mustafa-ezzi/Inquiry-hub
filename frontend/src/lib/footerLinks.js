/**
 * Footer / legal link helpers — maps display labels to in-app routes.
 */

import {
  LEGAL_PAGES as LEGAL_CONTENT_PAGES,
  SUPPORT_EMAIL,
  SUPPORT_WHATSAPP_URL,
} from "./legalContent";

const LABEL_TO_PATH = {
  "about us": "/about",
  about: "/about",
  contact: "/contact",
  "privacy policy": "/privacy",
  privacy: "/privacy",
  "terms of service": "/terms",
  terms: "/terms",
};

/**
 * @param {string} label
 * @returns {string | null}
 */
export function footerLinkPath(label) {
  if (typeof label !== "string" || !label.trim()) return null;
  return LABEL_TO_PATH[label.trim().toLowerCase()] ?? null;
}

/** @deprecated Prefer LEGAL_CONTENT; kept for tests / callers expecting this shape. */
export const LEGAL_PAGES = LEGAL_CONTENT_PAGES;

export { SUPPORT_EMAIL, SUPPORT_WHATSAPP_URL };
