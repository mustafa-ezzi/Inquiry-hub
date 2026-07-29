import { INQUIRY_STATUS } from "./inquiryStatus";

/**
 * Filter vendor inbox rows.
 * @param {Array<Record<string, unknown>>} items
 * @param {{ status?: string, productId?: string, query?: string }} filters
 */
export function filterVendorInbox(items, filters = {}) {
  const status = filters.status || "";
  const productId = filters.productId || "";
  const q = (filters.query || "").trim().toLowerCase();

  return (items || []).filter((row) => {
    if (status && row.status !== status) return false;
    if (productId && row.productId !== productId) return false;
    if (q) {
      const hay = [
        row.productName,
        row.buyerName,
        row.preview,
        row.phone,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

/**
 * Dashboard counts from inquiry list.
 * @param {Array<{ status?: string }>} items
 */
export function summarizeVendorLeads(items = []) {
  const openStatuses = new Set([
    INQUIRY_STATUS.OPEN,
    INQUIRY_STATUS.AWAITING_VENDOR,
    INQUIRY_STATUS.AWAITING_BUYER,
  ]);
  let open = 0;
  let awaitingVendor = 0;
  for (const row of items) {
    if (openStatuses.has(row.status)) open += 1;
    if (row.status === INQUIRY_STATUS.AWAITING_VENDOR) awaitingVendor += 1;
  }
  return {
    total: items.length,
    open,
    awaitingVendor,
    closed: items.length - open,
  };
}

/**
 * Unique products referenced in inbox (for filter dropdown).
 * @param {Array<{ productId?: string, productName?: string }>} items
 */
export function inboxProductOptions(items = []) {
  const map = new Map();
  for (const row of items) {
    if (!row.productId) continue;
    if (!map.has(row.productId)) {
      map.set(row.productId, row.productName || row.productId);
    }
  }
  return [...map.entries()].map(([id, name]) => ({ id, name }));
}
