/**
 * Footer / legal link helpers — maps display labels to in-app routes.
 */

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

export const LEGAL_PAGES = [
  {
    path: "/about",
    title: "About Us",
    summary:
      "InquireHub.PK helps buyers find hardware and metals suppliers across Pakistan and start quote conversations with vendors.",
  },
  {
    path: "/contact",
    title: "Contact",
    summary:
      "For support or partnership inquiries, email hello@inquirehub.pk. Full support channels will expand as we launch.",
  },
  {
    path: "/privacy",
    title: "Privacy Policy",
    summary:
      "We collect contact details you provide for inquiries (such as name and phone) to connect you with vendors. This placeholder will be replaced with a reviewed policy before GA (Phase 6).",
  },
  {
    path: "/terms",
    title: "Terms of Service",
    summary:
      "By using InquireHub.PK you agree to use the platform for legitimate B2B inquiries. This placeholder will be replaced with reviewed terms before GA (Phase 6).",
  },
];
