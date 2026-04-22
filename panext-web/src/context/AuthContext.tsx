"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  User, onAuthStateChanged, signOut,
  signInWithPopup, GoogleAuthProvider,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface AuthContextType {
  user:        User | null;
  loading:     boolean;
  logout:      () => Promise<void>;
  loginGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user:        null,
  loading:     true,
  logout:      async () => {},
  loginGoogle: async () => {},
});

const googleProvider = new GoogleAuthProvider();

// ─── Ensure Firestore profile exists for any user (email or Google) ───────────
async function ensureProfile(user: User) {
  const ref  = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      nombre:          user.displayName ?? "Usuario",
      email:           user.email ?? "",
      notifExpiracion: true,
      sugerenciasIA:   true,
      modoOscuro:      false,
      resumenSemanal:  false,
      creadoEn:        serverTimestamp(),
    });
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      // When any user signs in, make sure their Firestore profile exists
      if (u) await ensureProfile(u);
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  const loginGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
    // ensureProfile is called by onAuthStateChanged automatically
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, loginGoogle }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
