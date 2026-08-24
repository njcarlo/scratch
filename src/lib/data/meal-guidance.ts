import type { FoodItem, FoodTag } from "../types";

/**
 * Meal reflection notes — the "no diet culture" contextual guidance from
 * product Section 10, implemented as deterministic, rule-based copy rather
 * than a real AI call.
 *
 * This is intentionally NOT the AI Companion. There is no LLM configured in
 * this build (see src/lib/ai/provider.ts for that Phase 2 extension point),
 * and Section 37 says not to fake an integration that isn't there. What
 * this *can* honestly do today is look at the tags on the foods a user just
 * logged and return one of a small set of warm, pre-written, reviewed notes
 * — never a diagnosis, never "never eat X", always framed as one option
 * among many. Swapping this for real AI-generated guidance later is a
 * matter of replacing the body of `reflectOnMeal` with a provider call.
 */
export function reflectOnMeal(items: FoodItem[]): string {
  if (items.length === 0) {
    return "Log a meal and this space can offer a gentle, judgment-free reflection on it.";
  }

  const tags = new Set<FoodTag>(items.flatMap((f) => f.tags));
  const hasVeg = tags.has("vegetable_forward") || tags.has("high_fiber");
  const hasProtein = tags.has("high_protein");
  const hasFried = tags.has("fried");
  const hasSugaryDrink = tags.has("sugary_drink");
  const hasRiceHeavy = tags.has("rice_heavy") || tags.has("refined_carb");

  if (hasVeg && hasProtein) {
    return "This meal already has both a protein source and vegetables in it — a combination a lot of people aim for. No changes needed.";
  }
  if (hasSugaryDrink && !hasProtein && !hasVeg) {
    return "This one leans sweet. That's completely fine as part of a normal week — if you're aiming for more balance today, your next meal is an easy place to add some protein or vegetables.";
  }
  if (hasFried && hasRiceHeavy && !hasVeg) {
    return "Rice and something fried — a very normal Filipino meal, and rice doesn't need to be avoided. If you want more balance, a side of vegetables or a protein-forward next meal are both easy options, not requirements.";
  }
  if (hasProtein && !hasVeg) {
    return "Good protein in this one. Adding vegetables isn't mandatory, but it's one option if you're going for a more rounded meal later today.";
  }
  if (hasVeg && !hasProtein) {
    return "Nice and vegetable-forward. If you're still hungry, pairing it with a protein source is one way to help you feel fuller for longer — entirely optional.";
  }
  return "Logged. There's no 'good' or 'bad' meal here — this is just a record for you to notice your own patterns over time.";
}
