"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useProfile } from "@/lib/queries/profile";

export default function RootPage() {
  const { status } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading" || isLoading) return;
    if (profile?.onboardingCompletedAt) {
      router.replace("/home");
    } else {
      router.replace("/onboarding");
    }
  }, [status, isLoading, profile, router]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-cream-50">
      <p className="text-sm text-ink-400">Loading Gabay…</p>
    </div>
  );
}
