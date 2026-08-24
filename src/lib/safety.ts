/**
 * Central home for medical-safety copy and rules.
 *
 * Every screen that surfaces anything derived from user data (Insights,
 * Home summary, the future AI Companion) should pull its disclaimers from
 * here rather than writing its own — one place to review, one place to
 * change if the product's clinical-safety posture ever needs to shift.
 *
 * Three tiers the app must always keep visually distinct (see
 * <InfoTierBadge /> in src/components/ui/InfoTierBadge.tsx):
 *   1. "education"     — general PCOS/PMOS information, true for most people
 *   2. "personal"      — an observation computed from *this user's* own logs
 *   3. "clinician"      — needs a doctor; the app deliberately stops here
 */

export const APP_NAME = "Gabay";

export const GENERAL_DISCLAIMER =
  "Gabay is an educational and self-tracking tool. It does not diagnose PCOS/PMOS or any other condition, and it isn't a substitute for care from your doctor.";

export const INSIGHTS_DISCLAIMER =
  "These are patterns noticed in what you've logged — not a diagnosis, and not proof that one thing caused another. Consider bringing them up with your doctor.";

export const AI_DISCLAIMER =
  "This assistant shares general, educational information and can help you reflect on your own logs. It cannot diagnose you, prescribe or adjust medication, or replace your OB-GYN or endocrinologist.";

export const FOOD_NOTE_DISCLAIMER =
  "Food notes here are general and educational — no food 'treats' or 'cures' PCOS/PMOS. What works for one body may not work for another.";

/**
 * Symptoms that, when logged, warrant a gentle nudge toward professional
 * care rather than just a pattern-tracking note. Keep this list conservative
 * and non-alarming — the copy should never read as an emergency siren.
 */
export const SEEK_CARE_HINTS: Partial<Record<string, string>> = {
  irregular_spotting:
    "Bleeding that's heavy, prolonged, or very unpredictable is worth describing to your OB-GYN — they can check what's behind it.",
  cramps:
    "If pain is severe, sudden, or stops you from going about your day, please don't wait it out — get it checked.",
};

export function pcosStatusLabel(status: string | null): string {
  switch (status) {
    case "diagnosed":
      return "Diagnosed with PCOS/PMOS";
    case "suspected":
      return "Doctor suspects PCOS/PMOS";
    case "evaluating":
      return "Currently being evaluated";
    case "not_sure":
      return "Not sure yet";
    case "learning":
      return "Just learning";
    default:
      return "Not set";
  }
}
