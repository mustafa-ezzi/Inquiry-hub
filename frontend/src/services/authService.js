import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { ROLES, isValidRole } from "../lib/roles";

export const USERS_COLLECTION = "users";

/**
 * @param {import("firebase/auth").User} user
 * @param {{ displayName?: string, phone?: string, role?: string }} [extras]
 */
export async function ensureUserProfile(user, extras = {}) {
  const ref = doc(db, USERS_COLLECTION, user.uid);
  const snap = await getDoc(ref);
  const displayName =
    extras.displayName?.trim() ||
    user.displayName?.trim() ||
    user.email?.split("@")[0] ||
    "User";
  const phone = extras.phone?.trim() || "";
  const role =
    extras.role && isValidRole(extras.role) ? extras.role : ROLES.BUYER;

  if (!snap.exists()) {
    const profile = {
      uid: user.uid,
      email: user.email || "",
      displayName,
      phone,
      role,
      shopIds: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(ref, profile);
    return { ...profile, createdAt: null, updatedAt: null };
  }

  const data = snap.data();
  return {
    uid: user.uid,
    email: data.email || user.email || "",
    displayName: data.displayName || displayName,
    phone: data.phone || phone,
    role: isValidRole(data.role) ? data.role : ROLES.BUYER,
    shopIds: Array.isArray(data.shopIds) ? data.shopIds : [],
  };
}

/**
 * @param {{ email: string, password: string, displayName: string, phone?: string }} input
 */
export async function registerWithEmail({
  email,
  password,
  displayName,
  phone = "",
}) {
  const cred = await createUserWithEmailAndPassword(
    auth,
    email.trim(),
    password
  );
  if (displayName.trim()) {
    await updateProfile(cred.user, { displayName: displayName.trim() });
  }
  const profile = await ensureUserProfile(cred.user, {
    displayName,
    phone,
    role: ROLES.BUYER,
  });
  return { user: cred.user, profile };
}

/**
 * @param {{ email: string, password: string }} input
 */
export async function loginWithEmail({ email, password }) {
  const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
  const profile = await ensureUserProfile(cred.user);
  return { user: cred.user, profile };
}

export async function logout() {
  await signOut(auth);
}

/**
 * @param {string} uid
 * @param {{ displayName?: string, phone?: string }} patch
 */
export async function updateUserContact(uid, patch) {
  const ref = doc(db, USERS_COLLECTION, uid);
  const next = {
    updatedAt: serverTimestamp(),
  };
  if (typeof patch.displayName === "string") {
    next.displayName = patch.displayName.trim();
  }
  if (typeof patch.phone === "string") {
    next.phone = patch.phone.trim();
  }
  await updateDoc(ref, next);
  if (auth.currentUser && patch.displayName) {
    await updateProfile(auth.currentUser, {
      displayName: patch.displayName.trim(),
    });
  }
}

/**
 * Promote buyer → vendor and attach shop id (client-side; rules must allow).
 * @param {string} uid
 * @param {string} shopId
 */
export async function attachShopMembership(uid, shopId) {
  const ref = doc(db, USERS_COLLECTION, uid);
  const snap = await getDoc(ref);
  const data = snap.exists() ? snap.data() : {};
  const shopIds = Array.isArray(data.shopIds) ? [...data.shopIds] : [];
  if (!shopIds.includes(shopId)) shopIds.push(shopId);
  await setDoc(
    ref,
    {
      role: ROLES.VENDOR,
      shopIds,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
  return { role: ROLES.VENDOR, shopIds };
}

/**
 * Map Firebase Auth errors to readable copy.
 * @param {unknown} err
 */
export function authErrorMessage(err) {
  const code = err && typeof err === "object" && "code" in err ? err.code : "";
  const rawMessage =
    err && typeof err === "object" && "message" in err
      ? String(err.message)
      : "";

  if (
    rawMessage.includes("CONFIGURATION_NOT_FOUND") ||
    code === "auth/configuration-not-found" ||
    code === "auth/operation-not-allowed"
  ) {
    return "Firebase Authentication is not set up. In Firebase Console → Authentication → Sign-in method, enable Email/Password, then try again.";
  }

  switch (code) {
    case "auth/email-already-in-use":
      return "An account already exists with this email.";
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Incorrect email or password.";
    case "auth/too-many-requests":
      return "Too many attempts. Try again later.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    default:
      return rawMessage || "Authentication failed. Try again.";
  }
}
