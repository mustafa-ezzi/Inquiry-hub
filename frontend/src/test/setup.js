import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Firebase reads env at import time — provide test defaults before modules load.
if (!import.meta.env.VITE_FIREBASE_API_KEY) {
  Object.assign(import.meta.env, {
    VITE_FIREBASE_API_KEY: "test-api-key",
    VITE_FIREBASE_AUTH_DOMAIN: "test.firebaseapp.com",
    VITE_FIREBASE_PROJECT_ID: "test-project",
    VITE_FIREBASE_STORAGE_BUCKET: "test.appspot.com",
    VITE_FIREBASE_MESSAGING_SENDER_ID: "123456789",
    VITE_FIREBASE_APP_ID: "1:123456789:web:abcdef",
  });
}

vi.mock("firebase/auth", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getAuth: () => ({ currentUser: null }),
    setPersistence: vi.fn(() => Promise.resolve()),
    browserLocalPersistence: {},
    onAuthStateChanged: (_auth, cb) => {
      cb(null);
      return () => {};
    },
  };
});
