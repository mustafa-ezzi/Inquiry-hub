import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { ANALYTICS_EVENTS, trackEvent } from "./analytics";

export const REPORTS_COLLECTION = "reports";
export const PRODUCTS_COLLECTION = "products";
export const INQUIRIES_COLLECTION = "inquiries";

export const REPORT_TARGET = Object.freeze({
  PRODUCT: "product",
  INQUIRY: "inquiry",
  SHOP: "shop",
});

export const REPORT_STATUS = Object.freeze({
  OPEN: "open",
  RESOLVED: "resolved",
});

/**
 * @param {{
 *   targetType: string,
 *   targetId: string,
 *   reason: string,
 *   reporterUid: string,
 *   details?: string,
 * }} args
 */
export async function createReport({
  targetType,
  targetId,
  reason,
  reporterUid,
  details = "",
}) {
  if (!reporterUid) throw new Error("Sign in required to report.");
  const type = String(targetType || "").trim();
  const id = String(targetId || "").trim();
  const why = String(reason || "").trim();
  if (!type || !id || why.length < 3) {
    throw new Error("Target and a short reason are required.");
  }
  const ref = await addDoc(collection(db, REPORTS_COLLECTION), {
    targetType: type,
    targetId: id,
    reason: why,
    details: String(details || "").trim(),
    reporterUid,
    status: REPORT_STATUS.OPEN,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await trackEvent(ANALYTICS_EVENTS.REPORT_CREATED, {
    reportId: ref.id,
    targetType: type,
  }, { requireConsent: false });
  return { id: ref.id };
}

/**
 * @param {number} [max]
 */
export async function listOpenReports(max = 50) {
  const q = query(
    collection(db, REPORTS_COLLECTION),
    where("status", "==", REPORT_STATUS.OPEN),
    orderBy("createdAt", "desc"),
    limit(max)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapReport(d.id, d.data()));
}

/**
 * @param {string} reportId
 * @param {{ resolution?: string }} [opts]
 */
export async function resolveReport(reportId, opts = {}) {
  if (!reportId) throw new Error("Missing report id.");
  await updateDoc(doc(db, REPORTS_COLLECTION, reportId), {
    status: REPORT_STATUS.RESOLVED,
    resolution: String(opts.resolution || "").trim(),
    updatedAt: serverTimestamp(),
  });
}

/**
 * @param {string} productId
 * @param {boolean} hidden
 */
export async function setProductHidden(productId, hidden) {
  if (!productId) throw new Error("Missing product id.");
  await updateDoc(doc(db, PRODUCTS_COLLECTION, productId), {
    hidden: Boolean(hidden),
    updated_at: serverTimestamp(),
  });
}

/**
 * @param {string} inquiryId
 * @param {boolean} hidden
 */
export async function setInquiryHidden(inquiryId, hidden) {
  if (!inquiryId) throw new Error("Missing inquiry id.");
  await updateDoc(doc(db, INQUIRIES_COLLECTION, inquiryId), {
    hidden: Boolean(hidden),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Hide all products for a shop (admin “Disable listings”).
 * @param {string} shopId
 * @param {Array<{ id: string }>} products
 */
export async function hideShopProducts(shopId, products) {
  if (!shopId) throw new Error("Missing shop id.");
  const list = products || [];
  await Promise.all(list.map((p) => setProductHidden(p.id, true)));
  return { count: list.length };
}

function mapReport(id, data = {}) {
  const createdRaw = data.createdAt;
  let createdAt = Date.now();
  if (typeof createdRaw === "number") createdAt = createdRaw;
  else if (createdRaw?.toMillis) createdAt = createdRaw.toMillis();
  else if (createdRaw?.seconds) createdAt = createdRaw.seconds * 1000;

  return {
    id,
    targetType: data.targetType || "",
    targetId: data.targetId || "",
    reason: data.reason || "",
    details: data.details || "",
    reporterUid: data.reporterUid || "",
    status: data.status || REPORT_STATUS.OPEN,
    createdAt,
  };
}
