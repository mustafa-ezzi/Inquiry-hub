/**
 * Inquiry chat facade (Phase 3).
 *
 * Backend selection:
 * 1. `VITE_INQUIRY_API_BASE` → external REST
 * 2. Else Firestore (production default)
 * 3. localStorage only when `import.meta.env.DEV` && `VITE_INQUIRY_DEMO_LOCAL=true`
 */

import {
  createFirestoreInquiry,
  fetchFirestoreMessages,
  findBuyerProductInquiry,
  listBuyerInquiries,
  sendFirestoreMessage,
  subscribeFirestoreMessages,
} from "./inquiryFirestoreService";

const API_BASE = import.meta.env.VITE_INQUIRY_API_BASE?.replace(/\/$/, "");

/** @type {null | "rest" | "firestore" | "local"} */
let backendOverride = null;

/** Test-only override. Pass `null` to clear. */
export function __setInquiryBackendForTests(value) {
  backendOverride = value;
}

function storageKey(productId) {
  return `inquiry_chat_${productId}`;
}

/**
 * @returns {"rest" | "firestore" | "local"}
 */
export function getInquiryBackend() {
  if (backendOverride) return backendOverride;
  if (API_BASE) return "rest";
  if (
    import.meta.env.DEV &&
    String(import.meta.env.VITE_INQUIRY_DEMO_LOCAL || "") === "true"
  ) {
    return "local";
  }
  return "firestore";
}

export function isInquiryApiConfigured() {
  return getInquiryBackend() !== "local";
}

export function usesFirestoreInquiries() {
  return getInquiryBackend() === "firestore";
}

/**
 * @returns {null | { inquiryId: string, buyerName: string, phone: string, messages: Array }}
 */
export function loadStoredInquiry(productId) {
  if (getInquiryBackend() !== "local") return null;
  try {
    const raw = localStorage.getItem(storageKey(productId));
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data?.inquiryId || !Array.isArray(data.messages)) return null;
    return data;
  } catch {
    return null;
  }
}

function saveStored(productId, data) {
  localStorage.setItem(storageKey(productId), JSON.stringify(data));
}

/**
 * Create inquiry (REST | Firestore | local demo).
 * Firestore requires `buyerUid` (signed-in user).
 */
export async function createInquiry({
  productId,
  buyerName,
  phone,
  message,
  productName = "",
  vendorName = "",
  vendorLocation = "",
  shopId = "",
  buyerUid = "",
}) {
  const backend = getInquiryBackend();

  if (backend === "rest") {
    const res = await fetch(`${API_BASE}/inquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        buyerName,
        phone,
        message,
        productName,
        vendorName,
        vendorLocation,
        shopId,
        buyerUid,
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(t || `HTTP ${res.status}`);
    }
    const body = await res.json();
    const inquiryId = body.inquiryId ?? body.id;
    if (!inquiryId) throw new Error("Invalid response: missing inquiry id");
    return { inquiryId };
  }

  if (backend === "firestore") {
    return createFirestoreInquiry({
      productId,
      shopId,
      buyerUid,
      buyerName,
      phone,
      message,
      productName,
      vendorName,
      vendorLocation,
    });
  }

  // —— local demo ——
  const inquiryId = `local_${Date.now()}`;
  const now = Date.now();
  const data = {
    inquiryId,
    buyerName: buyerName.trim(),
    phone: phone.trim(),
    productName: (productName || "").trim(),
    vendorName: (vendorName || "").trim(),
    vendorLocation: (vendorLocation || "").trim(),
    messages: [
      {
        id: `m_${now}`,
        role: "buyer",
        senderName: buyerName.trim(),
        senderRole: "You",
        body: message.trim(),
        createdAt: now,
      },
    ],
  };
  saveStored(productId, data);
  return { inquiryId };
}

export async function fetchMessages({ inquiryId, productId }) {
  const backend = getInquiryBackend();

  if (backend === "rest") {
    const res = await fetch(
      `${API_BASE}/inquiries/${encodeURIComponent(inquiryId)}/messages`
    );
    if (!res.ok) throw new Error(`Failed to load messages (${res.status})`);
    const body = await res.json();
    if (Array.isArray(body)) return { messages: body };
    return { messages: body.messages ?? body.data ?? [] };
  }

  if (backend === "firestore") {
    return fetchFirestoreMessages(inquiryId);
  }

  const stored = loadStoredInquiry(productId);
  if (!stored || stored.inquiryId !== inquiryId) return { messages: [] };
  return { messages: [...stored.messages] };
}

/**
 * Subscribe to messages when using Firestore; otherwise poll via callback once.
 * @returns {() => void} unsubscribe
 */
export function subscribeMessages({ inquiryId, productId }, onData, onError) {
  if (getInquiryBackend() === "firestore") {
    return subscribeFirestoreMessages(inquiryId, onData, onError);
  }
  void fetchMessages({ inquiryId, productId })
    .then((r) => onData(r.messages || []))
    .catch((e) => onError?.(e));
  return () => {};
}

export async function sendBuyerMessage({
  inquiryId,
  productId,
  buyerName,
  body,
  buyerUid = "",
}) {
  const text = body.trim();
  if (!text) return;

  const backend = getInquiryBackend();

  if (backend === "rest") {
    const res = await fetch(
      `${API_BASE}/inquiries/${encodeURIComponent(inquiryId)}/messages`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text }),
      }
    );
    if (!res.ok) {
      const t = await res.text();
      throw new Error(t || `HTTP ${res.status}`);
    }
    return;
  }

  if (backend === "firestore") {
    await sendFirestoreMessage({
      inquiryId,
      body: text,
      role: "buyer",
      senderName: buyerName,
      senderUid: buyerUid,
      senderRole: "You",
    });
    return;
  }

  const stored = loadStoredInquiry(productId);
  if (!stored || stored.inquiryId !== inquiryId) {
    throw new Error("No local inquiry");
  }
  const now = Date.now();
  stored.messages.push({
    id: `m_${now}`,
    role: "buyer",
    senderName: buyerName.trim(),
    senderRole: "You",
    body: text,
    createdAt: now,
  });
  saveStored(productId, stored);
}

/**
 * Vendor reply (Firestore / REST). Used by Phase 4; available for tests now.
 */
export async function sendVendorMessage({
  inquiryId,
  body,
  vendorName,
  vendorUid,
}) {
  if (getInquiryBackend() === "firestore") {
    await sendFirestoreMessage({
      inquiryId,
      body,
      role: "vendor",
      senderName: vendorName,
      senderUid: vendorUid,
      senderRole: "Vendor",
    });
    return;
  }
  if (getInquiryBackend() === "rest") {
    const res = await fetch(
      `${API_BASE}/inquiries/${encodeURIComponent(inquiryId)}/messages`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, role: "vendor" }),
      }
    );
    if (!res.ok) throw new Error(await res.text());
    return;
  }
  throw new Error("Vendor messages require Firestore or REST backend.");
}

function normalizeListRow(raw) {
  const productId = String(raw.productId ?? raw.product_id ?? "");
  const inquiryId = String(raw.inquiryId ?? raw.id ?? "");
  const messages = Array.isArray(raw.messages) ? raw.messages : [];
  const last = messages.length ? messages[messages.length - 1] : null;
  const updatedAt =
    typeof raw.updatedAt === "number"
      ? raw.updatedAt
      : last?.createdAt
        ? typeof last.createdAt === "number"
          ? last.createdAt
          : new Date(last.createdAt).getTime()
        : Date.now();
  return {
    productId,
    inquiryId,
    productName: raw.productName || raw.product_name || "Product",
    vendorName: raw.vendorName || raw.vendor_name || "",
    vendorLocation: raw.vendorLocation || raw.vendor_location || "",
    preview: raw.preview || last?.body || "",
    status: raw.status || "",
    updatedAt,
    messages,
  };
}

/**
 * List inquiries for the current user.
 * @param {{ buyerUid?: string }} [opts]
 */
export async function listUserInquiries(opts = {}) {
  const backend = getInquiryBackend();

  if (backend === "rest") {
    try {
      const res = await fetch(`${API_BASE}/inquiries`);
      if (res.ok) {
        const body = await res.json();
        const arr = Array.isArray(body)
          ? body
          : body.inquiries ?? body.data ?? [];
        if (arr.length)
          return arr
            .map(normalizeListRow)
            .filter((r) => r.productId && r.inquiryId);
      }
    } catch {
      /* fall through */
    }
  }

  if (backend === "firestore") {
    const uid = opts.buyerUid;
    if (!uid) return [];
    const rows = await listBuyerInquiries(uid);
    return rows.map((r) => normalizeListRow(r));
  }

  const byProduct = new Map();

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith("inquiry_chat_")) continue;
    const productId = key.slice("inquiry_chat_".length);
    const data = loadStoredInquiry(productId);
    if (!data?.inquiryId) continue;
    const msgs = data.messages || [];
    const last = msgs[msgs.length - 1];
    byProduct.set(productId, {
      productId,
      inquiryId: data.inquiryId,
      productName: data.productName || "Product",
      vendorName: data.vendorName || "",
      vendorLocation: data.vendorLocation || "",
      preview: last?.body || "",
      updatedAt: last?.createdAt || 0,
      messages: msgs,
    });
  }

  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (!key?.startsWith("inquiry_session_")) continue;
    const productId = key.slice("inquiry_session_".length);
    if (byProduct.has(productId)) continue;
    try {
      const s = JSON.parse(sessionStorage.getItem(key) || "{}");
      if (!s?.inquiryId) continue;
      byProduct.set(productId, {
        productId,
        inquiryId: s.inquiryId,
        productName: s.productName || "Product",
        vendorName: s.vendorName || "",
        vendorLocation: s.vendorLocation || "",
        preview: "Tap to load conversation",
        updatedAt: Date.now(),
        messages: [],
      });
    } catch {
      /* ignore */
    }
  }

  return [...byProduct.values()].sort((a, b) => b.updatedAt - a.updatedAt);
}

export { findBuyerProductInquiry };
