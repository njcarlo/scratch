"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useProfile } from "@/lib/queries/profile";
import { useT } from "@/lib/i18n";

export default function RootPage() {
  const { status } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const router = useRouter();
  const t = useT();

  useEffect(() => {
    if (status === "loading") return;
    if (status === "signed_out") {
      router.replace("/login");
      return;
    }
    if (isLoading) return;
    if (profile?.onboardingCompletedAt) {
      router.replace("/home");
    } else {
      router.replace("/onboarding");
    }
  }, [status, isLoading, profile, router]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-cream-50">
      <p className="text-sm text-ink-400">{t("common.loading")}</p>
    </div>
  );
}
