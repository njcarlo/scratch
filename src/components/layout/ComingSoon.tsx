"use client";

import type { ComponentType, SVGProps } from "react";
import { Card } from "@/components/ui/Card";
import { useT, type StringKey } from "@/lib/i18n";

interface ComingSoonProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  titleKey: StringKey;
  bodyKey: StringKey;
}

/**
 * Shared placeholder for Phase-2 surfaces that the shell already links
 * to (`/ai`, `/community`, `/healthcare`). Copy lives in `stub.*`
 * dictionary keys — never invent listings, chat, or community posts here.
 */
export function ComingSoon({ icon: Icon, titleKey, bodyKey }: ComingSoonProps) {
  const t = useT();
  return (
    <Card className="flex flex-col items-center px-6 py-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-100 text-teal-700">
        <Icon className="h-7 w-7" />
      </div>
      <h1 className="mt-4 text-lg font-semibold text-ink-900">{t(titleKey)}</h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-500">{t(bodyKey)}</p>
    </Card>
  );
}
