import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { isValidRole, ROLES } from "../lib/roles";

export const USERS_COLLECTION = "users";

function mapUser(id, data = {}) {
  return {
    id,
    uid: data.uid || id,
    email: data.email || "",
    displayName: data.displayName || data.name || "",
    phone: data.phone || "",
    role: data.role || ROLES.BUYER,
    shopIds: Array.isArray(data.shopIds) ? data.shopIds : [],
  };
}

/**
 * @param {number} [max]
 */
export async function listUsers(max = 80) {
  const q = query(
    collection(db, USERS_COLLECTION),
    orderBy("displayName"),
    limit(max)
  );
  try {
    const snap = await getDocs(q);
    return snap.docs.map((d) => mapUser(d.id, d.data()));
  } catch {
    // Fallback if displayName index/order missing
    const snap = await getDocs(
      query(collection(db, USERS_COLLECTION), limit(max))
    );
    return snap.docs
      .map((d) => mapUser(d.id, d.data()))
      .sort((a, b) =>
        (a.displayName || a.email).localeCompare(b.displayName || b.email)
      );
  }
}

/**
 * @param {string} userId
 * @param {string} role
 */
export async function setUserRole(userId, role) {
  if (!userId) throw new Error("Missing user id.");
  if (!isValidRole(role)) throw new Error("Invalid role.");
  await updateDoc(doc(db, USERS_COLLECTION, userId), { role });
}
