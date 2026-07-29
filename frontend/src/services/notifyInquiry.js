/**
 * New-inquiry notification provider (Phase 4).
 * Swap `setInquiryNotifier` for email/SMS later; default is console + optional browser Notification.
 */

/**
 * @typedef {{
 *   inquiryId: string,
 *   shopId?: string,
 *   productName?: string,
 *   buyerName?: string,
 *   preview?: string,
 * }} InquiryNotifyPayload
 */

/**
 * @param {InquiryNotifyPayload} payload
 */
async function defaultNotifier(payload) {
  if (typeof console !== "undefined") {
    console.info("[inquiry-notify]", payload);
  }
  if (typeof window !== "undefined" && "Notification" in window) {
    if (Notification.permission === "granted") {
      new Notification("New inquiry", {
        body: `${payload.buyerName || "Buyer"}: ${payload.preview || payload.productName || "New lead"}`,
      });
    }
  }
}

/** @type {(payload: InquiryNotifyPayload) => Promise<void> | void} */
let notifier = defaultNotifier;

/**
 * @param {(payload: InquiryNotifyPayload) => Promise<void> | void} fn
 */
export function setInquiryNotifier(fn) {
  notifier = fn;
}

export function resetInquiryNotifier() {
  notifier = defaultNotifier;
}

/**
 * @param {InquiryNotifyPayload} payload
 */
export async function notifyNewInquiry(payload) {
  await notifier(payload);
}

/** Request browser notification permission (call from a user gesture). */
export async function requestInquiryNotifyPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  return Notification.requestPermission();
}
