"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useT, type StringKey } from "@/lib/i18n";
import { useAuth } from "@/lib/auth/AuthProvider";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const t = useT();
  const router = useRouter();
  const {
    status,
    isDemo,
    emailLinkNeedsEmail,
    signInWithPassword,
    signUpWithPassword,
    signInWithMagicLink,
    completeEmailLinkSignIn,
  } = useAuth();

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<StringKey | null>(null);
  const [busy, setBusy] = useState(false);
  const [linkSent, setLinkSent] = useState(false);

  useEffect(() => {
    if (isDemo) {
      router.replace("/");
      return;
    }
    if (status === "signed_in") {
      router.replace("/");
    }
  }, [status, isDemo, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (emailLinkNeedsEmail) {
        const result = await completeEmailLinkSignIn(email.trim());
        if (result.error) setError(result.error as StringKey);
        return;
      }
      const action = mode === "signin" ? signInWithPassword : signUpWithPassword;
      const result = await action(email.trim(), password);
      if (result.error) setError(result.error as StringKey);
    } finally {
      setBusy(false);
    }
  }

  async function handleMagicLink() {
    setError(null);
    setBusy(true);
    try {
      const result = await signInWithMagicLink(email.trim());
      if (result.error) setError(result.error as StringKey);
      else setLinkSent(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-app flex-col justify-between bg-cream-50 px-6 py-10">
      <div className="mt-10">
        <p className="text-sm font-medium uppercase tracking-wide text-teal-600">
          {t("app.name")}
        </p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight text-ink-900">
          {emailLinkNeedsEmail
            ? t("auth.confirmEmailTitle")
            : mode === "signin"
              ? t("auth.title")
              : t("auth.signUpTitle")}
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-600">
          {emailLinkNeedsEmail
            ? t("auth.confirmEmailBody")
            : mode === "signin"
              ? t("auth.subtitle")
              : t("auth.signUpSubtitle")}
        </p>

        {linkSent ? (
          <p className="mt-8 rounded-xl2 border border-teal-100 bg-teal-50 px-4 py-3 text-sm text-teal-800">
            {t("auth.magicLinkSent")}
          </p>
        ) : (
          <form className="mt-8 flex flex-col gap-3" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink-700">
                {t("auth.email")}
              </span>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl2 border border-ink-100 bg-white px-4 py-3 text-[15px]"
              />
            </label>
            {!emailLinkNeedsEmail && (
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink-700">
                  {t("auth.password")}
                </span>
                <input
                  type="password"
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl2 border border-ink-100 bg-white px-4 py-3 text-[15px]"
                />
              </label>
            )}
            {error && (
              <p className="text-sm text-blush-700" role="alert">
                {t(error)}
              </p>
            )}
            <Button type="submit" fullWidth disabled={busy}>
              {busy
                ? t("common.loading")
                : emailLinkNeedsEmail
                  ? t("auth.confirmEmailCta")
                  : mode === "signin"
                    ? t("auth.signIn")
                    : t("auth.signUp")}
            </Button>
            {!emailLinkNeedsEmail && (
              <Button
                type="button"
                variant="secondary"
                fullWidth
                disabled={busy || !email.trim()}
                onClick={handleMagicLink}
              >
                {t("auth.magicLink")}
              </Button>
            )}
          </form>
        )}
      </div>

      {!linkSent && !emailLinkNeedsEmail && (
        <button
          type="button"
          className="mt-8 text-sm font-medium text-teal-700"
          onClick={() => {
            setError(null);
            setMode(mode === "signin" ? "signup" : "signin");
          }}
        >
          {mode === "signin" ? t("auth.switchToSignUp") : t("auth.switchToSignIn")}
        </button>
      )}
    </div>
  );
}
