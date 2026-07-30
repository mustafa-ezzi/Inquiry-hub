/**
 * Launch-ready legal copy (Phase 6 MVP).
 * Have counsel review before GA; placeholders marked where numbers/emails may change.
 */

export const SUPPORT_EMAIL = "hello@inquirehub.pk";
export const SUPPORT_WHATSAPP_URL = "https://wa.me/923000000000";
export const SUPPORT_WHATSAPP_DISPLAY = "+92 300 0000000";

export const LEGAL_CONTENT = {
  "/about": {
    title: "About Us",
    lastUpdated: "2026-07-30",
    sections: [
      {
        heading: "What we do",
        body: `InquireHub.PK (also shown as Mart-Hub on some sign-in screens) is a B2B marketplace that helps buyers discover hardware and metals suppliers in Pakistan and start quote conversations with vendors.`,
      },
      {
        heading: "How it works",
        body: `Buyers browse products and shops, then send an inquiry with contact details. Vendors receive leads in the vendor portal and reply in-thread. We do not process payments or escrow on the platform in this release.`,
      },
      {
        heading: "Trust",
        body: `Shops may show Verified and Replies quickly badges based on platform review and response metrics. Badges are informational and not a guarantee of product quality or delivery.`,
      },
    ],
  },
  "/contact": {
    title: "Contact & support",
    lastUpdated: "2026-07-30",
    sections: [
      {
        heading: "Support channels",
        body: `Email: ${SUPPORT_EMAIL}. WhatsApp: ${SUPPORT_WHATSAPP_DISPLAY}. We aim to respond within one business day during Alpha.`,
      },
      {
        heading: "Abuse and listings",
        body: `Use Report on a product or inquiry thread. Our ops team reviews open reports in the admin console. For urgent safety issues, email support with the listing or thread ID.`,
      },
      {
        heading: "Partnerships",
        body: `Vendors interested in onboarding during Alpha should email support with shop name, city, and category focus.`,
      },
    ],
    supportEmail: SUPPORT_EMAIL,
    supportWhatsApp: SUPPORT_WHATSAPP_URL,
  },
  "/privacy": {
    title: "Privacy Policy",
    lastUpdated: "2026-07-30",
    sections: [
      {
        heading: "Who we are",
        body: `InquireHub.PK operates this website and related Firebase-backed services. Contact: ${SUPPORT_EMAIL}.`,
      },
      {
        heading: "Data we collect",
        body: `Account data (email, display name, phone you save on profile). Inquiry data (name, phone/WhatsApp, messages, product and shop references). Technical data (device/browser basics, auth session, optional analytics events such as inquiry_created). Reports you submit for moderation.`,
      },
      {
        heading: "Why we use it",
        body: `To create and operate your account, deliver inquiries to the relevant vendor, show conversation history, improve trust and operations (verification, response metrics), moderate abuse, and secure the service.`,
      },
      {
        heading: "Sharing",
        body: `Inquiry contact details and messages are shared with the vendor for that product/shop so they can reply. We use Google Firebase (Auth, Firestore) as infrastructure. We do not sell personal data. We may disclose information if required by law or to protect users from abuse.`,
      },
      {
        heading: "Retention",
        body: `Account and inquiry records are kept while your account is active and as needed for support, dispute handling, and legal obligations. You may request deletion by emailing ${SUPPORT_EMAIL}; some records may be retained where required for security or compliance.`,
      },
      {
        heading: "Cookies and analytics",
        body: `We use essential cookies/storage for sign-in and app function. Optional analytics (when enabled and consented) help us understand funnel events. See the in-app cookie notice to accept or decline non-essential analytics.`,
      },
      {
        heading: "Your choices",
        body: `You can update profile contact fields, stop using the service, decline analytics cookies, and contact us for access or deletion requests.`,
      },
      {
        heading: "Changes",
        body: `We may update this policy; the “Last updated” date above will change. Material changes will be noted on this page.`,
      },
    ],
  },
  "/terms": {
    title: "Terms of Service",
    lastUpdated: "2026-07-30",
    sections: [
      {
        heading: "Agreement",
        body: `By using InquireHub.PK you agree to these Terms. If you do not agree, do not use the service.`,
      },
      {
        heading: "The service",
        body: `We provide a marketplace for discovery and inquiry messaging between buyers and vendors. We are not a party to any sale, quotation, or delivery contract between users. Prices, specs, and fulfillment are between buyer and vendor.`,
      },
      {
        heading: "Accounts",
        body: `You must provide accurate information. You are responsible for activity under your account. Vendor and admin roles are granted per platform policy; admin accounts are assigned by operators only.`,
      },
      {
        heading: "Acceptable use",
        body: `Use the platform only for legitimate B2B inquiries. Do not post illegal, fraudulent, harassing, or infringing content; do not scrape or attack the service; do not attempt to bypass access controls.`,
      },
      {
        heading: "Listings and verification",
        body: `Vendors are responsible for listing accuracy. Verification and response badges are platform signals, not warranties. We may hide listings, suspend shops, or remove content for policy or legal reasons.`,
      },
      {
        heading: "Disclaimers",
        body: `The service is provided “as is” during Alpha/Beta. We do not guarantee uninterrupted availability or that any inquiry will convert to a sale.`,
      },
      {
        heading: "Limitation of liability",
        body: `To the maximum extent permitted by applicable law, InquireHub.PK is not liable for indirect or consequential damages arising from marketplace transactions between users. Our aggregate liability for claims relating to the service is limited to fees you paid us in the prior three months (if none, PKR 0 for this free Alpha).`,
      },
      {
        heading: "Contact",
        body: `Questions: ${SUPPORT_EMAIL}.`,
      },
    ],
  },
};

/** Paths still used by LegalPage routing helpers. */
export const LEGAL_PAGES = Object.entries(LEGAL_CONTENT).map(([path, page]) => ({
  path,
  title: page.title,
  summary: page.sections?.[0]?.body || "",
  supportEmail: page.supportEmail,
  supportWhatsApp: page.supportWhatsApp,
}));
