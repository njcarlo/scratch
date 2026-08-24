/**
 * Core domain types for Gabay.
 *
 * Storage-agnostic on purpose: nothing here assumes localStorage or
 * Firebase. Both `LocalRepository` and `FirebaseRepository`
 * (src/lib/data/*) implement the same `DataRepository` interface against
 * these types, so screens never know which one is active.
 */

export type Language = "en" | "tl-en"; // English or Taglish (Filipino/Tagalog: Phase 2, see i18n)

export type PCOSStatus =
  | "diagnosed" // has been diagnosed with PCOS/PMOS
  | "suspected" // doctor suspects it
  | "evaluating" // currently being evaluated/tested
  | "not_sure" // not sure, has some symptoms
  | "learning"; // just learning, no symptoms assumed

export type Goal =
  | "understand_cycle"
  | "manage_symptoms"
  | "lose_weight"
  | "maintain_weight"
  | "improve_eating"
  | "improve_energy"
  | "track_medication"
  | "track_supplements"
  | "prep_for_doctor"
  | "fertility_awareness"
  | "understand_pcos";

export type AgeRange = "18-24" | "25-30" | "31-35" | "36-40" | "41-45" | "46+";

export type CycleRegularity = "regular" | "irregular" | "unknown";
export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "unknown";

export interface UserProfile {
  id: string;
  language: Language;
  pcosStatus: PCOSStatus | null;
  ageRange: AgeRange | null;
  goals: Goal[];
  displayName: string | null;

  // Onboarding Step 4 — cycle baseline (self-reported, never assumed)
  lastPeriodStart: string | null; // ISO date
  typicalCycleLengthDays: number | null; // null if unknown/highly variable
  typicalBleedingDays: number | null;
  cycleRegularity: CycleRegularity | null;

  // Onboarding Step 6 — lifestyle (all optional, no shaming copy anywhere)
  heightCm: number | null;
  activityLevel: ActivityLevel | null;
  trackWeight: boolean;

  onboardingCompletedAt: string | null; // ISO datetime
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
}

// ---------------------------------------------------------------------------
// Cycle
// ---------------------------------------------------------------------------

export type CycleEventType = "period_start" | "period_end" | "spotting";
export type FlowLevel = "light" | "medium" | "heavy";

export interface CycleLog {
  id: string;
  date: string; // ISO date (yyyy-MM-dd)
  type: CycleEventType;
  flow?: FlowLevel;
  note?: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Symptoms
// ---------------------------------------------------------------------------

export type SymptomCategory =
  | "menstrual"
  | "hormonal_skin"
  | "metabolic_energy"
  | "digestive"
  | "mental_wellbeing"
  | "custom";

export type SymptomKey =
  | "cramps"
  | "spotting"
  | "acne"
  | "oily_skin"
  | "hair_growth" // excess facial/body hair
  | "hair_thinning" // scalp hair thinning
  | "fatigue"
  | "hunger"
  | "cravings"
  | "bloating"
  | "constipation"
  | "diarrhea"
  | "headache"
  | "mood_swings"
  | "stress"
  | "anxiety"
  | "sleep_trouble"
  | "weight_changes"
  | "skin_darkening"
  | "pelvic_discomfort";

export const SYMPTOM_CATEGORY_OF: Record<SymptomKey, SymptomCategory> = {
  cramps: "menstrual",
  spotting: "menstrual",
  acne: "hormonal_skin",
  oily_skin: "hormonal_skin",
  hair_growth: "hormonal_skin",
  hair_thinning: "hormonal_skin",
  fatigue: "metabolic_energy",
  hunger: "metabolic_energy",
  cravings: "metabolic_energy",
  bloating: "digestive",
  constipation: "digestive",
  diarrhea: "digestive",
  headache: "metabolic_energy",
  mood_swings: "mental_wellbeing",
  stress: "mental_wellbeing",
  anxiety: "mental_wellbeing",
  sleep_trouble: "mental_wellbeing",
  weight_changes: "metabolic_energy",
  skin_darkening: "hormonal_skin",
  pelvic_discomfort: "menstrual",
};

/** None / Mild / Moderate / Severe, per spec Section 8. */
export type Severity = 0 | 1 | 2 | 3;
export type MoodLevel = 1 | 2 | 3 | 4 | 5; // struggling -> great

export interface SymptomEntry {
  key: SymptomKey;
  severity: Severity;
}

export interface CustomSymptom {
  id: string;
  label: string;
}

export interface SymptomLog {
  id: string;
  date: string; // ISO date
  symptoms: SymptomEntry[];
  customSymptoms?: { label: string; severity: Severity }[];
  mood: MoodLevel | null;
  sleepHours: number | null;
  note?: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Filipino Food Intelligence
// ---------------------------------------------------------------------------

export type FoodCategory =
  | "rice_viand"
  | "fast_food"
  | "coffee_beverage"
  | "street_food"
  | "snack"
  | "convenience_store"
  | "soup"
  | "noodles"
  | "dessert"
  | "staple"; // rice, pandesal, eggs, etc.

/** How much we trust the nutrition numbers on a given food item. */
export type DataConfidence = "verified" | "estimated" | "user_submitted";

export interface NutritionFacts {
  servingSize: string; // free text, e.g. "1 cup (150g)", "1 regular meal"
  calories?: number;
  proteinG?: number;
  carbsG?: number;
  fiberG?: number;
  fatG?: number;
  sodiumMg?: number;
  sugarG?: number;
}

export interface FoodItem {
  id: string;
  name: string; // primary display name, e.g. "Chickenjoy 1pc w/ Rice"
  nameEn?: string; // plain-English description if the local name needs it
  nameTl?: string; // Filipino/Tagalog name, e.g. "sinigang na baboy"
  brand?: string; // "Jollibee", "Mang Inasal", "7-Eleven" — omitted for home-cooked/generic
  source?: string; // e.g. "Home-cooked", "Home-cooked / Carinderia" — used when there's no brand
  category: FoodCategory;
  nutrition: NutritionFacts;
  tags: FoodTag[];
  note?: string; // short, educational, non-diagnostic
  dataSource: string; // e.g. "Brand-published nutrition guide (2023)", "Philippine FCT estimate"
  dataConfidence: DataConfidence;
  lastUpdated: string; // ISO date
}

export type FoodTag =
  | "rice_heavy"
  | "fried"
  | "sugary_drink"
  | "high_protein"
  | "vegetable_forward"
  | "processed"
  | "grilled"
  | "contains_offal"
  | "coconut_milk"
  | "refined_carb"
  | "high_fiber";

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface FoodLogItem {
  foodId?: string; // present when chosen from the database
  customName?: string; // used when a user logs something not in the database
  portion?: string; // free text, e.g. "1 cup", "regular", "2 pcs"
}

export interface FoodLog {
  id: string;
  date: string; // ISO date
  time: string; // HH:mm
  mealType: MealType;
  items: FoodLogItem[];
  note?: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Health: weight + medications/supplements (Phase 1 = weight; meds/labs
// captured at onboarding but full management UI is Phase 2, see Health screen)
// ---------------------------------------------------------------------------

export interface WeightLog {
  id: string;
  date: string; // ISO date
  kg: number;
  note?: string;
  createdAt: string;
}

export type MedType = "medication" | "supplement";

export interface MedicationEntry {
  id: string;
  name: string;
  type: MedType;
  dosage?: string;
  frequency?: string;
  prescribedBy?: string; // e.g. "OB-GYN", "Endocrinologist", "Self-started"
  startedAt?: string; // ISO date
  active: boolean;
  note?: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Lab results — Phase 2 (type defined now so the schema/extension point is
// ready; no UI reads/writes this in Phase 1).
// ---------------------------------------------------------------------------

export type LabTestKey =
  | "hba1c"
  | "fasting_glucose"
  | "fasting_insulin"
  | "lipid_profile"
  | "testosterone"
  | "lh"
  | "fsh"
  | "dheas"
  | "tsh"
  | "vitamin_d"
  | "custom";

export interface LabResult {
  id: string;
  date: string; // ISO date
  test: LabTestKey;
  customTestName?: string;
  value: number;
  unit: string;
  referenceRangeLow?: number;
  referenceRangeHigh?: number;
  labName?: string;
  note?: string;
  createdAt: string;
}
