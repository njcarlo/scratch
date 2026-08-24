"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/lib/i18n";
import { SparkleIcon } from "../icons";

/**
 * Prominent floating action button to the AI Companion (Section 4). It
 * currently opens the Phase 2 "coming soon" screen — see
 * src/app/(app)/ai/page.tsx — but lives in the shell now so the nav
 * doesn't need to change shape when that screen becomes real.
 */
export function AiFab() {
  const t = useT();
  const pathname = usePathname();
  if (pathname?.startsWith("/ai")) return null;
  return (
    <Link
      href="/ai"
      aria-label={t("nav.ai")}
      // `fixed` so it stays put while the page scrolls; the inline `right`
      // clamps to the edge of the centered max-w-app (480px) column on
      // wide screens instead of drifting to the actual viewport edge.
      className="fixed bottom-[76px] z-30 flex h-14 w-14 items-center justify-center rounded-full bg-blush-500 text-white shadow-soft hover:bg-blush-600"
      style={{ right: "max(1rem, calc(50vw - 224px))" }}
    >
      <SparkleIcon className="h-6 w-6" />
    </Link>
  );
}
