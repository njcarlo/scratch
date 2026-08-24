import clsx from "clsx";
import { useT } from "@/lib/i18n";

export type InfoTier = "education" | "personal" | "clinician";

const styles: Record<InfoTier, string> = {
  education: "bg-teal-100 text-teal-700",
  personal: "bg-mango-100 text-mango-600",
  clinician: "bg-blush-100 text-blush-700",
};

/**
 * The visual marker that keeps Section 2's three information tiers
 * distinguishable at a glance, wherever the app surfaces something
 * computed or written for the user (Insights, Home, Food notes).
 */
export function InfoTierBadge({ tier }: { tier: InfoTier }) {
  const t = useT();
  const label =
    tier === "education"
      ? t("safety.tierEducation")
      : tier === "personal"
      ? t("safety.tierPersonal")
      : t("safety.tierClinician");
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        styles[tier]
      )}
    >
      {label}
    </span>
  );
}
