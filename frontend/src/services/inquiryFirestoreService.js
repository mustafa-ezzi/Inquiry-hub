import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { INQUIRY_STATUS, statusAfterMessage } from "../lib/inquiryStatus";
import {
  isValidMessageBody,
  validateInquiryOnboarding,
} from "../lib/inquiryValidation";
import { notifyNewInquiry } from "./notifyInquiry";

export const INQUIRIES_COLLECTION = "inquiries";

function messagesCol(inquiryId) {
  return collection(db, INQUIRIES_COLLECTION, inquiryId, "messages");
}

/**
 * Normalize Firestore message doc → UI message.
 * @param {string} id
 * @param {Record<string, unknown>} data
 */
export function mapMessageDoc(id, data = {}) {
  const createdAtRaw = data.createdAt;
  let createdAt = Date.now();
  if (typeof createdAtRaw === "number") createdAt = createdAtRaw;
  else if (createdAtRaw?.toMillis) createdAt = createdAtRaw.toMillis();
  else if (createdAtRaw?.seconds)
    createdAt = createdAtRaw.seconds * 1000;

  return {
    id,
    role: data.role === "vendor" ? "vendor" : "buyer",
    senderName: data.senderName || (data.role === "vendor" ? "Vendor" : "You"),
    senderRole: data.senderRole || "",
    body: data.body || "",
    createdAt,
    senderUid: data.senderUid || "",
  };
}

/**
 * @param {string} id
 * @param {Record<string, unknown>} data
 */
export function mapInquiryDoc(id, data = {}) {
  const updatedAtRaw = data.updatedAt;
  let updatedAt = Date.now();
  if (typeof updatedAtRaw === "number") updatedAt = updatedAtRaw;
  else if (updatedAtRaw?.toMillis) updatedAt = updatedAtRaw.toMillis();
  else if (updatedAtRaw?.seconds) updatedAt = updatedAtRaw.seconds * 1000;

  return {
    inquiryId: id,
    productId: data.productId || "",
    shopId: data.shopId || "",
    buyerUid: data.buyerUid || "",
    buyerName: data.buyerName || "",
    phone: data.phone || "",
    productName: data.productName || "Product",
    vendorName: data.vendorName || "",
    vendorLocation: data.vendorLocation || "",
    status: data.status || INQUIRY_STATUS.OPEN,
    preview: data.preview || "",
    updatedAt,
    messages: [],
  };
}

/**
 * @param {string} inquiryId
 */
export async function getInquiry(inquiryId) {
  if (!inquiryId) return null;
  const snap = await getDoc(doc(db, INQUIRIES_COLLECTION, inquiryId));
  if (!snap.exists()) return null;
  return mapInquiryDoc(snap.id, snap.data());
}

/**
 * Find an existing inquiry for this buyer + product (any status).
 * @param {{ buyerUid: string, productId: string }} args
 */
export async function findBuyerProductInquiry({ buyerUid, productId }) {
  if (!buyerUid || !productId) return null;
  const q = query(
    collection(db, INQUIRIES_COLLECTION),
    where("buyerUid", "==", buyerUid),
    where("productId", "==", productId),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return mapInquiryDoc(d.id, d.data());
}

/**
 * Create inquiry + first buyer message in Firestore.
 */
export async function createFirestoreInquiry({
  productId,
  shopId = "",
  buyerUid,
  buyerName,
  phone,
  message,
  productName = "",
  vendorName = "",
  vendorLocation = "",
}) {
  if (!buyerUid) {
    throw new Error("Sign in required to create an inquiry.");
  }
  const validationError = validateInquiryOnboarding({
    buyerName,
    phone,
    message,
  });
  if (validationError) throw new Error(validationError);

  const existing = await findBuyerProductInquiry({ buyerUid, productId });
  if (existing) {
    await sendFirestoreMessage({
      inquiryId: existing.inquiryId,
      body: message,
      role: "buyer",
      senderName: buyerName.trim(),
      senderUid: buyerUid,
      senderRole: "You",
    });
    return { inquiryId: existing.inquiryId, existing: true };
  }

  const name = buyerName.trim();
  const text = message.trim();
  const inquiryRef = await addDoc(collection(db, INQUIRIES_COLLECTION), {
    productId: String(productId),
    shopId: shopId ? String(shopId) : "",
    buyerUid,
    buyerName: name,
    phone: phone.trim(),
    productName: (productName || "").trim() || "Product",
    vendorName: (vendorName || "").trim(),
    vendorLocation: (vendorLocation || "").trim(),
    status: INQUIRY_STATUS.AWAITING_VENDOR,
    preview: text.slice(0, 200),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await addDoc(messagesCol(inquiryRef.id), {
    role: "buyer",
    senderName: name,
    senderRole: "You",
    senderUid: buyerUid,
    body: text,
    createdAt: serverTimestamp(),
  });

  try {
    await notifyNewInquiry({
      inquiryId: inquiryRef.id,
      shopId: shopId ? String(shopId) : "",
      productName: (productName || "").trim() || "Product",
      buyerName: name,
      preview: text.slice(0, 200),
    });
  } catch (err) {
    console.warn("notifyNewInquiry failed", err);
  }

  return { inquiryId: inquiryRef.id, existing: false };
}

/**
 * List inquiries for the signed-in buyer.
 * @param {string} buyerUid
 */
export async function listBuyerInquiries(buyerUid) {
  if (!buyerUid) return [];
  const q = query(
    collection(db, INQUIRIES_COLLECTION),
    where("buyerUid", "==", buyerUid),
    orderBy("updatedAt", "desc"),
    limit(50)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapInquiryDoc(d.id, d.data()));
}

/**
 * List inquiries for a vendor's shop (Phase 4 inbox).
 * @param {string} shopId
 */
export async function listShopInquiries(shopId) {
  if (!shopId) return [];
  const q = query(
    collection(db, INQUIRIES_COLLECTION),
    where("shopId", "==", shopId),
    orderBy("updatedAt", "desc"),
    limit(50)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapInquiryDoc(d.id, d.data()));
}

/**
 * Realtime shop inbox.
 * @param {string} shopId
 * @param {(rows: ReturnType<typeof mapInquiryDoc>[]) => void} onData
 * @param {(err: Error) => void} [onError]
 */
export function subscribeShopInquiries(shopId, onData, onError) {
  if (!shopId) {
    onData([]);
    return () => {};
  }
  const q = query(
    collection(db, INQUIRIES_COLLECTION),
    where("shopId", "==", shopId),
    orderBy("updatedAt", "desc"),
    limit(50)
  );
  return onSnapshot(
    q,
    (snap) => {
      onData(snap.docs.map((d) => mapInquiryDoc(d.id, d.data())));
    },
    (err) => {
      console.error(err);
      onError?.(err);
    }
  );
}

/**
 * One-shot fetch of messages.
 */
export async function fetchFirestoreMessages(inquiryId) {
  if (!inquiryId) return { messages: [] };
  const q = query(messagesCol(inquiryId), orderBy("createdAt", "asc"), limit(200));
  const snap = await getDocs(q);
  return {
    messages: snap.docs.map((d) => mapMessageDoc(d.id, d.data())),
  };
}

/**
 * Realtime message subscription.
 * @param {string} inquiryId
 * @param {(messages: ReturnType<typeof mapMessageDoc>[]) => void} onData
 * @param {(err: Error) => void} [onError]
 * @returns {() => void} unsubscribe
 */
export function subscribeFirestoreMessages(inquiryId, onData, onError) {
  if (!inquiryId) {
    onData([]);
    return () => {};
  }
  const q = query(messagesCol(inquiryId), orderBy("createdAt", "asc"), limit(200));
  return onSnapshot(
    q,
    (snap) => {
      onData(snap.docs.map((d) => mapMessageDoc(d.id, d.data())));
    },
    (err) => {
      console.error(err);
      onError?.(err);
    }
  );
}

/**
 * Append a message and bump inquiry status / preview.
 */
export async function sendFirestoreMessage({
  inquiryId,
  body,
  role,
  senderName,
  senderUid,
  senderRole = "",
}) {
  const text = typeof body === "string" ? body.trim() : "";
  if (!isValidMessageBody(text)) {
    throw new Error(`Message must be 1–2000 characters.`);
  }
  if (!inquiryId || !senderUid) {
    throw new Error("Missing inquiry or sender.");
  }

  await addDoc(messagesCol(inquiryId), {
    role: role === "vendor" ? "vendor" : "buyer",
    senderName: (senderName || "").trim() || (role === "vendor" ? "Vendor" : "Buyer"),
    senderRole: senderRole || "",
    senderUid,
    body: text,
    createdAt: serverTimestamp(),
  });

  await updateDoc(doc(db, INQUIRIES_COLLECTION, inquiryId), {
    status: statusAfterMessage(role === "vendor" ? "vendor" : "buyer"),
    preview: text.slice(0, 200),
    updatedAt: serverTimestamp(),
  });
}
