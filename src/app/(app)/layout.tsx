"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/layout/AppHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { AiFab } from "@/components/layout/AiFab";
import { DemoModeBanner } from "@/components/layout/DemoModeBanner";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useProfile } from "@/lib/queries/profile";

export default function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const router = useRouter();

  useEffect(() => {
    if (status === "signed_out") {
      router.replace("/login");
      return;
    }
    if (!isLoading && profile && !profile.onboardingCompletedAt) {
      router.replace("/onboarding");
    }
  }, [isLoading, profile, router, status]);

  return (
    <div className="mx-auto min-h-dvh max-w-app bg-cream-50">
      <DemoModeBanner />
      <AppHeader />
      <main className="px-4 pb-28 pt-4">{children}</main>
      <AiFab />
      <BottomNav />
    </div>
  );
}
