import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import {
  attachShopMembership,
  ensureUserProfile,
  loginWithEmail,
  logout as authLogout,
  registerWithEmail,
  updateUserContact,
} from "../services/authService";
import { ROLES } from "../lib/roles";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      if (!nextUser) {
        setProfile(null);
        setLoading(false);
        return;
      }
      try {
        const p = await ensureUserProfile(nextUser);
        setProfile(p);
      } catch (err) {
        console.error(err);
        setProfile({
          uid: nextUser.uid,
          email: nextUser.email || "",
          displayName: nextUser.displayName || "",
          phone: "",
          role: ROLES.BUYER,
          shopIds: [],
        });
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const login = useCallback(async (email, password) => {
    const result = await loginWithEmail({ email, password });
    setUser(result.user);
    setProfile(result.profile);
    return result;
  }, []);

  const register = useCallback(async ({ email, password, displayName, phone }) => {
    const result = await registerWithEmail({
      email,
      password,
      displayName,
      phone,
    });
    setUser(result.user);
    setProfile(result.profile);
    return result;
  }, []);

  const logout = useCallback(async () => {
    await authLogout();
    setUser(null);
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!auth.currentUser) return null;
    const p = await ensureUserProfile(auth.currentUser);
    setProfile(p);
    return p;
  }, []);

  const saveContact = useCallback(
    async ({ displayName, phone }) => {
      if (!user) throw new Error("Not signed in");
      await updateUserContact(user.uid, { displayName, phone });
      await refreshProfile();
    },
    [user, refreshProfile]
  );

  const linkShop = useCallback(
    async (shopId) => {
      if (!user) throw new Error("Not signed in");
      const next = await attachShopMembership(user.uid, shopId);
      setProfile((prev) =>
        prev
          ? { ...prev, role: next.role, shopIds: next.shopIds }
          : prev
      );
      return next;
    },
    [user]
  );

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      isAuthenticated: Boolean(user),
      role: profile?.role || null,
      shopIds: profile?.shopIds || [],
      login,
      register,
      logout,
      refreshProfile,
      saveContact,
      linkShop,
    }),
    [
      user,
      profile,
      loading,
      login,
      register,
      logout,
      refreshProfile,
      saveContact,
      linkShop,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
