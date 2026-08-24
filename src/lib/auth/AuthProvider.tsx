"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  createUserWithEmailAndPassword,
  isSignInWithEmailLink,
  onAuthStateChanged,
  sendSignInLinkToEmail,
  signInWithEmailAndPassword,
  signInWithEmailLink,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "../firebase/client";
import { LocalStorageAdapter } from "../storage";
import { makeId } from "../id";
import type { AuthContextValue, AuthStatus, AuthUser } from "./types";

const AuthContext = createContext<AuthContextValue | null>(null);

const DEMO_USER_KEY = "gabay:demo-user-id";
const EMAIL_FOR_LINK_KEY = "gabay:emailForSignIn";

/**
 * Real auth when Firebase is configured; otherwise a single persistent
 * on-device "guest" identity so Demo Mode has a stable user id to key
 * localStorage data on. The demo identity is never presented as a secure
 * account anywhere in the UI — see <DemoModeBanner />.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [emailLinkNeedsEmail, setEmailLinkNeedsEmail] = useState(false);

  useEffect(() => {
    if (!isFirebaseConfigured) {
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

    const auth = getFirebaseAuth();
    if (!auth) {
      setStatus("signed_out");
      return;
    }

    if (typeof window !== "undefined" && isSignInWithEmailLink(auth, window.location.href)) {
      const stored = window.localStorage.getItem(EMAIL_FOR_LINK_KEY);
      if (stored) {
        signInWithEmailLink(auth, stored, window.location.href)
          .then(() => {
            window.localStorage.removeItem(EMAIL_FOR_LINK_KEY);
          })
          .catch(() => {
            setEmailLinkNeedsEmail(true);
          });
      } else {
        setEmailLinkNeedsEmail(true);
      }
    }

    const unsub = onAuthStateChanged(auth, (fbUser) => {
      setUser(
        fbUser
          ? { id: fbUser.uid, email: fbUser.email ?? null, isDemo: false }
          : null
      );
      setStatus(fbUser ? "signed_in" : "signed_out");
    });

    return () => unsub();
  }, []);

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    const auth = getFirebaseAuth();
    if (!auth) return { error: "auth.error.unavailable" };
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { error: null };
    } catch (err) {
      return { error: firebaseErrorKey(err) };
    }
  }, []);

  const signUpWithPassword = useCallback(async (email: string, password: string) => {
    const auth = getFirebaseAuth();
    if (!auth) return { error: "auth.error.unavailable" };
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      return { error: null };
    } catch (err) {
      return { error: firebaseErrorKey(err) };
    }
  }, []);

  const signInWithMagicLink = useCallback(async (email: string) => {
    const auth = getFirebaseAuth();
    if (!auth) return { error: "auth.error.unavailable" };
    try {
      const url =
        typeof window !== "undefined"
          ? `${window.location.origin}/login`
          : "/login";
      await sendSignInLinkToEmail(auth, email, {
        url,
        handleCodeInApp: true,
      });
      if (typeof window !== "undefined") {
        window.localStorage.setItem(EMAIL_FOR_LINK_KEY, email);
      }
      return { error: null };
    } catch (err) {
      return { error: firebaseErrorKey(err) };
    }
  }, []);

  const signOut = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (auth) await firebaseSignOut(auth);
  }, []);

  const completeEmailLinkSignIn = useCallback(async (email: string) => {
    const auth = getFirebaseAuth();
    if (!auth || typeof window === "undefined") {
      return { error: "auth.error.unavailable" };
    }
    try {
      await signInWithEmailLink(auth, email, window.location.href);
      window.localStorage.removeItem(EMAIL_FOR_LINK_KEY);
      setEmailLinkNeedsEmail(false);
      return { error: null };
    } catch (err) {
      return { error: firebaseErrorKey(err) };
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      isDemo: user?.isDemo ?? !isFirebaseConfigured,
      emailLinkNeedsEmail,
      signInWithPassword,
      signUpWithPassword,
      signInWithMagicLink,
      completeEmailLinkSignIn,
      signOut,
    }),
    [
      user,
      status,
      emailLinkNeedsEmail,
      signInWithPassword,
      signUpWithPassword,
      signInWithMagicLink,
      completeEmailLinkSignIn,
      signOut,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

function firebaseErrorKey(err: unknown): string {
  const code =
    typeof err === "object" && err && "code" in err
      ? String((err as { code: string }).code)
      : "";
  switch (code) {
    case "auth/invalid-email":
      return "auth.error.invalidEmail";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "auth.error.invalid";
    case "auth/email-already-in-use":
      return "auth.error.emailInUse";
    case "auth/weak-password":
      return "auth.error.weakPassword";
    case "auth/too-many-requests":
      return "auth.error.tooMany";
    default:
      return "auth.error.generic";
  }
}
