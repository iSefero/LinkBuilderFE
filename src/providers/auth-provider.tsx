"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  getCurrentUser,
  signInWithGoogle,
  signOut as storeSignOut,
} from "@/lib/mock-store";
import type { User } from "@/lib/types";

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const current = await getCurrentUser();
    setUser(current);
  }, []);

  useEffect(() => {
    getCurrentUser().then((current) => {
      setUser(current);
      setIsLoading(false);
    });
  }, []);

  const signIn = useCallback(async (email: string) => {
    const loggedIn = await signInWithGoogle(email);
    setUser(loggedIn);
  }, []);

  const signOut = useCallback(async () => {
    await storeSignOut();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, signIn, signOut, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
