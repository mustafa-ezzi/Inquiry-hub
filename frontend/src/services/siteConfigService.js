import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import {
  SUPPORT_EMAIL,
  SUPPORT_WHATSAPP_URL,
} from "../lib/legalContent";

export const SITE_CONFIG_DOC = "config/site";

/**
 * @typedef {{
 *   supportEmail: string,
 *   supportWhatsAppUrl: string,
 *   ctaLabel: string,
 *   ctaTo: string,
 * }} SiteConfig
 */

/** @returns {SiteConfig} */
export function defaultSiteConfig() {
  return {
    supportEmail: SUPPORT_EMAIL,
    supportWhatsAppUrl: SUPPORT_WHATSAPP_URL,
    ctaLabel: "Register as Vendor",
    ctaTo: "/vendor-waitlist",
  };
}

/**
 * @param {Partial<SiteConfig> | null | undefined} data
 * @returns {SiteConfig}
 */
export function mergeSiteConfig(data) {
  const base = defaultSiteConfig();
  if (!data || typeof data !== "object") return base;
  return {
    supportEmail:
      typeof data.supportEmail === "string" && data.supportEmail.trim()
        ? data.supportEmail.trim()
        : base.supportEmail,
    supportWhatsAppUrl:
      typeof data.supportWhatsAppUrl === "string" &&
      data.supportWhatsAppUrl.trim()
        ? data.supportWhatsAppUrl.trim()
        : base.supportWhatsAppUrl,
    ctaLabel:
      typeof data.ctaLabel === "string" && data.ctaLabel.trim()
        ? data.ctaLabel.trim()
        : base.ctaLabel,
    ctaTo:
      typeof data.ctaTo === "string" && data.ctaTo.trim()
        ? data.ctaTo.trim()
        : base.ctaTo,
  };
}

export async function fetchSiteConfig() {
  try {
    const snap = await getDoc(doc(db, "config", "site"));
    if (!snap.exists()) return defaultSiteConfig();
    return mergeSiteConfig(snap.data());
  } catch {
    return defaultSiteConfig();
  }
}

/**
 * @param {Partial<SiteConfig>} patch
 */
export async function saveSiteConfig(patch) {
  const next = mergeSiteConfig({
    ...(await fetchSiteConfig()),
    ...patch,
  });
  await setDoc(
    doc(db, "config", "site"),
    { ...next, updatedAt: serverTimestamp() },
    { merge: true }
  );
  return next;
}
