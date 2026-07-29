import { beforeEach, describe, expect, it, vi } from "vitest";

const createUserWithEmailAndPassword = vi.fn();
const signInWithEmailAndPassword = vi.fn();
const signOut = vi.fn();
const updateProfile = vi.fn();
const getDoc = vi.fn();
const setDoc = vi.fn();
const updateDoc = vi.fn();
const doc = vi.fn((...args) => ({ path: args.join("/") }));
const serverTimestamp = vi.fn(() => "ts");

vi.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: (...a) => createUserWithEmailAndPassword(...a),
  signInWithEmailAndPassword: (...a) => signInWithEmailAndPassword(...a),
  signOut: (...a) => signOut(...a),
  updateProfile: (...a) => updateProfile(...a),
}));

vi.mock("firebase/firestore", () => ({
  doc: (...a) => doc(...a),
  getDoc: (...a) => getDoc(...a),
  setDoc: (...a) => setDoc(...a),
  updateDoc: (...a) => updateDoc(...a),
  serverTimestamp: (...a) => serverTimestamp(...a),
}));

vi.mock("../lib/firebase", () => ({
  auth: { currentUser: null },
  db: {},
}));

describe("authService", () => {
  beforeEach(() => {
    vi.resetModules();
    createUserWithEmailAndPassword.mockReset();
    signInWithEmailAndPassword.mockReset();
    signOut.mockReset();
    updateProfile.mockReset();
    getDoc.mockReset();
    setDoc.mockReset();
    updateDoc.mockReset();
  });

  it("ensureUserProfile creates a buyer profile when missing", async () => {
    getDoc.mockResolvedValue({ exists: () => false });
    setDoc.mockResolvedValue(undefined);
    const { ensureUserProfile } = await import("./authService");
    const profile = await ensureUserProfile(
      { uid: "u1", email: "a@b.com", displayName: "Ali" },
      { phone: "0300" }
    );
    expect(profile.role).toBe("buyer");
    expect(profile.displayName).toBe("Ali");
    expect(setDoc).toHaveBeenCalled();
  });

  it("ensureUserProfile returns existing profile", async () => {
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        email: "a@b.com",
        displayName: "Sara",
        phone: "0311",
        role: "vendor",
        shopIds: ["s1"],
      }),
    });
    const { ensureUserProfile } = await import("./authService");
    const profile = await ensureUserProfile({
      uid: "u2",
      email: "a@b.com",
    });
    expect(profile).toMatchObject({
      role: "vendor",
      shopIds: ["s1"],
      displayName: "Sara",
    });
  });

  it("registerWithEmail creates auth user and profile", async () => {
    const user = { uid: "u3", email: "n@e.com", displayName: null };
    createUserWithEmailAndPassword.mockResolvedValue({ user });
    updateProfile.mockResolvedValue(undefined);
    getDoc.mockResolvedValue({ exists: () => false });
    setDoc.mockResolvedValue(undefined);
    const { registerWithEmail } = await import("./authService");
    const result = await registerWithEmail({
      email: "n@e.com",
      password: "secret1",
      displayName: "New User",
      phone: "0322",
    });
    expect(result.user).toBe(user);
    expect(result.profile.displayName).toBe("New User");
    expect(updateProfile).toHaveBeenCalled();
  });

  it("loginWithEmail loads profile", async () => {
    const user = { uid: "u4", email: "l@e.com", displayName: "Lee" };
    signInWithEmailAndPassword.mockResolvedValue({ user });
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        displayName: "Lee",
        phone: "",
        role: "buyer",
        shopIds: [],
        email: "l@e.com",
      }),
    });
    const { loginWithEmail } = await import("./authService");
    const result = await loginWithEmail({
      email: "l@e.com",
      password: "secret1",
    });
    expect(result.profile.role).toBe("buyer");
  });

  it("logout signs out", async () => {
    signOut.mockResolvedValue(undefined);
    const { logout } = await import("./authService");
    await logout();
    expect(signOut).toHaveBeenCalled();
  });

  it("attachShopMembership upgrades to vendor", async () => {
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ shopIds: [], role: "buyer" }),
    });
    setDoc.mockResolvedValue(undefined);
    const { attachShopMembership } = await import("./authService");
    const next = await attachShopMembership("u5", "shop-9");
    expect(next.role).toBe("vendor");
    expect(next.shopIds).toContain("shop-9");
  });

  it("updateUserContact patches profile fields", async () => {
    updateDoc.mockResolvedValue(undefined);
    const { updateUserContact } = await import("./authService");
    await updateUserContact("u6", { displayName: "Updated", phone: "0333" });
    expect(updateDoc).toHaveBeenCalled();
  });
});
