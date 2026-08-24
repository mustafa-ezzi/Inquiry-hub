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
import {
  isValidWaitlistStatus,
  validateWaitlistSubmission,
  WAITLIST_STATUS,
} from "../lib/waitlistValidation";

export const WAITLIST_COLLECTION = "vendorWaitlist";

function mapWaitlistDoc(id, data = {}) {
  const raw = data.createdAt;
  let createdAt = Date.now();
  if (typeof raw === "number") createdAt = raw;
  else if (raw?.toMillis) createdAt = raw.toMillis();
  else if (raw?.seconds) createdAt = raw.seconds * 1000;

  return {
    id,
    name: data.name || "",
    phone: data.phone || "",
    shopName: data.shopName || "",
    location: data.location || "",
    status: data.status || WAITLIST_STATUS.PENDING,
    notes: data.notes || "",
    applicantUid: data.applicantUid || "",
    shopId: data.shopId || "",
    createdAt,
  };
}

/**
 * @param {{
 *   name: string,
 *   phone: string,
 *   shopName: string,
 *   location?: string,
 *   applicantUid?: string,
 * }} args
 */
export async function submitWaitlist({
  name,
  phone,
  shopName,
  location = "",
  applicantUid = "",
}) {
  const err = validateWaitlistSubmission({ name, phone, shopName });
  if (err) throw new Error(err);

  const payload = {
    name: name.trim(),
    phone: phone.trim(),
    shopName: shopName.trim(),
    location: String(location || "").trim(),
    status: WAITLIST_STATUS.PENDING,
    notes: "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  if (applicantUid) payload.applicantUid = applicantUid;

  const ref = await addDoc(collection(db, WAITLIST_COLLECTION), payload);
  return { id: ref.id };
}

/**
 * @param {{ status?: string, max?: number }} [opts]
 */
export async function listWaitlist(opts = {}) {
  const max = opts.max || 80;
  const status = opts.status || "";
  let q;
  if (status && isValidWaitlistStatus(status)) {
    q = query(
      collection(db, WAITLIST_COLLECTION),
      where("status", "==", status),
      orderBy("createdAt", "desc"),
      limit(max)
    );
  } else {
    q = query(
      collection(db, WAITLIST_COLLECTION),
      orderBy("createdAt", "desc"),
      limit(max)
    );
  }
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapWaitlistDoc(d.id, d.data()));
}

/**
 * @param {string} id
 * @param {{ status: string, notes?: string, shopId?: string }} patch
 */
export async function updateWaitlistStatus(id, patch) {
  if (!id) throw new Error("Missing waitlist id.");
  if (!isValidWaitlistStatus(patch.status)) {
    throw new Error("Invalid waitlist status.");
  }
  const next = {
    status: patch.status,
    updatedAt: serverTimestamp(),
  };
  if (typeof patch.notes === "string") next.notes = patch.notes.trim();
  if (typeof patch.shopId === "string") next.shopId = patch.shopId;
  await updateDoc(doc(db, WAITLIST_COLLECTION, id), next);
}

export async function countPendingWaitlist() {
  const rows = await listWaitlist({ status: WAITLIST_STATUS.PENDING, max: 100 });
  return rows.length;
}
