export interface AuthUser {
  id: string;
  email: string | null;
  /** True when this is the on-device Demo Mode identity, not a real account. */
  isDemo: boolean;
}

export type AuthStatus = "loading" | "signed_in" | "signed_out";

export interface AuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
  isDemo: boolean;
  /** True when the current URL is an email sign-in link that still needs the user's email. */
  emailLinkNeedsEmail: boolean;
  signInWithPassword: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithPassword: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithMagicLink: (email: string) => Promise<{ error: string | null }>;
  completeEmailLinkSignIn: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}
