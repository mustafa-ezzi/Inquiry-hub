const API_BASE = import.meta.env.VITE_INQUIRY_API_BASE?.replace(/\/$/, "");

function storageKey(productId) {
  return `inquiry_chat_${productId}`;
}

export function isInquiryApiConfigured() {
  return Boolean(API_BASE);
}

/**
 * @returns {null | { inquiryId: string, buyerName: string, phone: string, messages: Array<{id: string, role: string, senderName: string, senderRole?: string, body: string, createdAt: number}> }}
 */
export function loadStoredInquiry(productId) {
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
 * POST create inquiry. Server: POST /inquiries body { productId, buyerName, phone, message, productName?, vendorName?, vendorLocation? }
 * Expects JSON { inquiryId } or { id }.
 */
export async function createInquiry({
  productId,
  buyerName,
  phone,
  message,
  productName = "",
  vendorName = "",
  vendorLocation = "",
}) {
  if (API_BASE) {
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

/**
 * GET messages. Server: GET /inquiries/:inquiryId/messages → { messages } or array
 */
export async function fetchMessages({ inquiryId, productId }) {
  if (API_BASE) {
    const res = await fetch(
      `${API_BASE}/inquiries/${encodeURIComponent(inquiryId)}/messages`
    );
    if (!res.ok) throw new Error(`Failed to load messages (${res.status})`);
    const body = await res.json();
    if (Array.isArray(body)) return { messages: body };
    return { messages: body.messages ?? body.data ?? [] };
  }

  const stored = loadStoredInquiry(productId);
  if (!stored || stored.inquiryId !== inquiryId) return { messages: [] };
  return { messages: [...stored.messages] };
}

/**
 * POST new buyer message. Server: POST /inquiries/:id/messages { body }
 */
export async function sendBuyerMessage({
  inquiryId,
  productId,
  buyerName,
  body,
}) {
  const text = body.trim();
  if (!text) return;

  if (API_BASE) {
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
    updatedAt,
    messages,
  };
}

/**
 * Lists inquiries for the current browser (localStorage + session hints) or GET /inquiries when API is set.
 */
export async function listUserInquiries() {
  if (API_BASE) {
    try {
      const res = await fetch(`${API_BASE}/inquiries`);
      if (res.ok) {
        const body = await res.json();
        const arr = Array.isArray(body) ? body : body.inquiries ?? body.data ?? [];
        if (arr.length) return arr.map(normalizeListRow).filter((r) => r.productId && r.inquiryId);
      }
    } catch {
      /* fall through */
    }
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
