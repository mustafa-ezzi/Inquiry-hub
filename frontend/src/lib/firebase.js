import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const {
  VITE_FIREBASE_API_KEY,
  VITE_FIREBASE_AUTH_DOMAIN,
  VITE_FIREBASE_DATABASE_URL,
  VITE_FIREBASE_PROJECT_ID,
  VITE_FIREBASE_STORAGE_BUCKET,
  VITE_FIREBASE_MESSAGING_SENDER_ID,
  VITE_FIREBASE_APP_ID,
  VITE_FIREBASE_MEASUREMENT_ID,
} = import.meta.env;

const required = [
  ["VITE_FIREBASE_API_KEY", VITE_FIREBASE_API_KEY],
  ["VITE_FIREBASE_AUTH_DOMAIN", VITE_FIREBASE_AUTH_DOMAIN],
  ["VITE_FIREBASE_PROJECT_ID", VITE_FIREBASE_PROJECT_ID],
  ["VITE_FIREBASE_STORAGE_BUCKET", VITE_FIREBASE_STORAGE_BUCKET],
  ["VITE_FIREBASE_MESSAGING_SENDER_ID", VITE_FIREBASE_MESSAGING_SENDER_ID],
  ["VITE_FIREBASE_APP_ID", VITE_FIREBASE_APP_ID],
];

for (const [name, value] of required) {
  if (value == null || String(value).trim() === "") {
    throw new Error(
      `Missing ${name}. Copy .env.example to .env and set Firebase values from the Firebase console.`
    );
  }
}

const firebaseConfig = {
  apiKey: VITE_FIREBASE_API_KEY,
  authDomain: VITE_FIREBASE_AUTH_DOMAIN,
  ...(VITE_FIREBASE_DATABASE_URL?.trim()
    ? { databaseURL: VITE_FIREBASE_DATABASE_URL.trim() }
    : {}),
  projectId: VITE_FIREBASE_PROJECT_ID,
  storageBucket: VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: VITE_FIREBASE_APP_ID,
  ...(VITE_FIREBASE_MEASUREMENT_ID?.trim()
    ? { measurementId: VITE_FIREBASE_MEASUREMENT_ID.trim() }
    : {}),
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

/** Persist sessions across browser restarts (Phase 2). */
void setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.warn("Auth persistence unavailable:", err?.message || err);
});
