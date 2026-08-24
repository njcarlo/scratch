"use client";

import { useCallback } from "react";
import { useSessionStore } from "../session-store";
import { dictionaries, type StringKey } from "./dictionary";

export type { StringKey } from "./dictionary";

/**
 * `const t = useT(); t("nav.home")` — the only sanctioned way to render
 * user-facing copy. See dictionary.ts for the full string table and why
 * this exists (Section 20: no hardcoded UI strings, natural Taglish, an
 * additive path to Filipino/Tagalog later).
 */
export function useT() {
  const language = useSessionStore((s) => s.language);
  return useCallback(
    (key: StringKey, vars?: Record<string, string | number>) => {
      let str = dictionaries[language][key] ?? dictionaries.en[key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          str = str.replaceAll(`{{${k}}}`, String(v));
        }
      }
      return str;
    },
    [language]
  );
}

export function useLanguage() {
  const language = useSessionStore((s) => s.language);
  const setLanguage = useSessionStore((s) => s.setLanguage);
  return { language, setLanguage };
}
