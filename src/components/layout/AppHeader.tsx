"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useT } from "@/lib/i18n";
import { CommunityIcon, ProfileIcon, StethoscopeIcon } from "../icons";

const secondary = [
  { href: "/healthcare", key: "nav.healthcare" as const, Icon: StethoscopeIcon },
  { href: "/community", key: "nav.community" as const, Icon: CommunityIcon },
  { href: "/profile", key: "nav.profile" as const, Icon: ProfileIcon },
];

export function AppHeader() {
  const pathname = usePathname();
  const t = useT();
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-ink-100 bg-cream-50/95 px-4 py-3 backdrop-blur">
      <Link href="/home" className="text-lg font-semibold tracking-tight text-ink-900">
        {t("app.name")}
      </Link>
      <nav aria-label="Secondary" className="flex items-center gap-1">
        {secondary.map(({ href, key, Icon }) => {
          const active =
            pathname === href || Boolean(pathname?.startsWith(`${href}/`));
          return (
            <Link
              key={href}
              href={href}
              aria-label={t(key)}
              aria-current={active ? "page" : undefined}
              className={clsx(
                "flex h-9 w-9 items-center justify-center rounded-full",
                active ? "bg-teal-100 text-teal-700" : "text-ink-400 hover:bg-ink-50"
              )}
            >
              <Icon className="h-[18px] w-[18px]" />
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
