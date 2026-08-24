import { InfoIcon } from "../icons";
import { useT, type StringKey } from "@/lib/i18n";

/**
 * The reusable, non-alarming safety notice. Pull the copy from
 * src/lib/i18n/dictionary.ts (safety.*) — never write disclaimer text
 * inline at a call site.
 */
export function DisclaimerBanner({
  stringKey = "safety.general",
  className,
}: {
  stringKey?: Extract<StringKey, `safety.${string}`>;
  className?: string;
}) {
  const t = useT();
  return (
    <div
      className={`flex items-start gap-2.5 rounded-xl2 bg-teal-50 px-3.5 py-3 text-[13px] leading-snug text-teal-800 ${
        className ?? ""
      }`}
    >
      <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
      <p>{t(stringKey)}</p>
    </div>
  );
}
