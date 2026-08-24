"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useT } from "@/lib/i18n";
import {
  CycleIcon,
  FoodIcon,
  HealthIcon,
  HomeIcon,
  InsightsIcon,
} from "../icons";

const items = [
  { href: "/home", key: "nav.home" as const, Icon: HomeIcon },
  { href: "/cycle", key: "nav.cycle" as const, Icon: CycleIcon },
  { href: "/food", key: "nav.food" as const, Icon: FoodIcon },
  { href: "/insights", key: "nav.insights" as const, Icon: InsightsIcon },
  { href: "/health", key: "nav.health" as const, Icon: HealthIcon },
];

export function BottomNav() {
  const pathname = usePathname();
  const t = useT();
  return (
    <nav
      className="fixed bottom-0 left-1/2 z-30 w-full max-w-app -translate-x-1/2 border-t border-ink-100 bg-white/95 backdrop-blur pb-[env(safe-area-inset-bottom)]"
      aria-label="Primary"
    >
      <ul className="flex items-stretch justify-between px-1">
        {items.map(({ href, key, Icon }) => {
          const active = pathname?.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "flex min-h-[56px] flex-col items-center justify-center gap-0.5 py-1.5 text-[11px] font-medium",
                  active ? "text-teal-700" : "text-ink-400"
                )}
              >
                <Icon className="h-5 w-5" />
                {t(key)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
