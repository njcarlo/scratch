"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getSupabaseClient, isSupabaseConfigured } from "../supabase/client";
import { LocalStorageAdapter } from "../storage";
import { makeId } from "../id";
import type { AuthContextValue, AuthStatus, AuthUser } from "./types";

const AuthContext = createContext<AuthContextValue | null>(null);

const DEMO_USER_KEY = "gabay:demo-user-id";

/**
 * Real auth when Supabase is configured; otherwise a single persistent
 * on-device "guest" identity so Demo Mode has a stable user id to key
 * localStorage data on. The demo identity is never presented as a secure
 * account anywhere in the UI — see <DemoModeBanner />.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // One-time read of an external system (localStorage) on mount to
      // establish the stable Demo Mode identity — not a subscription, so
      // there's nothing to move out of the effect.
      const adapter = new LocalStorageAdapter();
      let id = adapter.getItem(DEMO_USER_KEY);
      if (!id) {
        id = makeId();
        adapter.setItem(DEMO_USER_KEY, id);
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser({ id, email: null, isDemo: true });
      setStatus("signed_in");
      return;
    }

    const client = getSupabaseClient();
    if (!client) {
      setStatus("signed_out");
      return;
    }

    client.auth.getSession().then(({ data }) => {
      const authUser = data.session?.user;
      setUser(authUser ? { id: authUser.id, email: authUser.email ?? null, isDemo: false } : null);
      setStatus(authUser ? "signed_in" : "signed_out");
    });

    const { data: sub } = client.auth.onAuthStateChange((_event, session) => {
      const authUser = session?.user;
      setUser(authUser ? { id: authUser.id, email: authUser.email ?? null, isDemo: false } : null);
      setStatus(authUser ? "signed_in" : "signed_out");
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    const client = getSupabaseClient();
    if (!client) return { error: "Not available in Demo Mode." };
    const { error } = await client.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signUpWithPassword = useCallback(async (email: string, password: string) => {
    const client = getSupabaseClient();
    if (!client) return { error: "Not available in Demo Mode." };
    const { error } = await client.auth.signUp({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signInWithMagicLink = useCallback(async (email: string) => {
    const client = getSupabaseClient();
    if (!client) return { error: "Not available in Demo Mode." };
    const { error } = await client.auth.signInWithOtp({ email });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    const client = getSupabaseClient();
    if (client) await client.auth.signOut();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      isDemo: user?.isDemo ?? !isSupabaseConfigured,
      signInWithPassword,
      signUpWithPassword,
      signInWithMagicLink,
      signOut,
    }),
    [user, status, signInWithPassword, signUpWithPassword, signInWithMagicLink, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
