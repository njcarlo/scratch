"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useT } from "@/lib/i18n";

export function DemoModeBanner() {
  const { isDemo } = useAuth();
  const t = useT();
  if (!isDemo) return null;
  return (
    <Link
      href="/profile"
      className="block bg-mango-100 px-4 py-1.5 text-center text-xs font-medium text-ink-800 hover:bg-mango-300"
    >
      {t("demoMode.banner")}
    </Link>
  );
}
