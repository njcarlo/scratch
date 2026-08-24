import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CycleLog,
  FoodLog,
  MedicationEntry,
  SymptomLog,
  UserProfile,
  WeightLog,
} from "../types";
import type { DataRepository } from "./repository";

/**
 * Live backend: Postgres via Supabase, row-level security scoped to
 * `auth.uid()`. Schema + RLS policies: supabase/migrations/0001_init.sql.
 *
 * This class is real, working code — but it is only ever instantiated (see
 * getRepository() in index.ts) when NEXT_PUBLIC_SUPABASE_URL /
 * NEXT_PUBLIC_SUPABASE_ANON_KEY are set, i.e. once you've created a
 * Supabase project and run the migration. Until then the app runs on
 * LocalRepository instead. See SETUP.md.
 */
export class SupabaseRepository implements DataRepository {
  readonly mode = "live" as const;
  constructor(private db: SupabaseClient) {}

  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await this.db
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    if (error) throw error;
    return data ? fromProfileRow(data) : null;
  }

  async saveProfile(userId: string, profile: UserProfile): Promise<void> {
    const { error } = await this.db
      .from("profiles")
      .upsert(toProfileRow(userId, profile));
    if (error) throw error;
  }

  async listCycleLogs(userId: string): Promise<CycleLog[]> {
    const { data, error } = await this.db
      .from("cycle_logs")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(fromCycleRow);
  }
  async addCycleLog(userId: string, log: CycleLog): Promise<void> {
    const { error } = await this.db
      .from("cycle_logs")
      .insert({ ...toCycleRow(log), user_id: userId });
    if (error) throw error;
  }
  async removeCycleLog(userId: string, id: string): Promise<void> {
    const { error } = await this.db
      .from("cycle_logs")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
    if (error) throw error;
  }

  async listSymptomLogs(userId: string): Promise<SymptomLog[]> {
    const { data, error } = await this.db
      .from("symptom_logs")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(fromSymptomRow);
  }
  async upsertSymptomLog(userId: string, log: SymptomLog): Promise<void> {
    const { error } = await this.db
      .from("symptom_logs")
      .upsert(
        { ...toSymptomRow(log), user_id: userId },
        { onConflict: "user_id,date" }
      );
    if (error) throw error;
  }
  async removeSymptomLog(userId: string, id: string): Promise<void> {
    const { error } = await this.db
      .from("symptom_logs")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
    if (error) throw error;
  }

  async listFoodLogs(userId: string): Promise<FoodLog[]> {
    const { data, error } = await this.db
      .from("food_logs")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(fromFoodRow);
  }
  async addFoodLog(userId: string, log: FoodLog): Promise<void> {
    const { error } = await this.db
      .from("food_logs")
      .insert({ ...toFoodRow(log), user_id: userId });
    if (error) throw error;
  }
  async removeFoodLog(userId: string, id: string): Promise<void> {
    const { error } = await this.db
      .from("food_logs")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
    if (error) throw error;
  }

  async listWeightLogs(userId: string): Promise<WeightLog[]> {
    const { data, error } = await this.db
      .from("weight_logs")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(fromWeightRow);
  }
  async addWeightLog(userId: string, log: WeightLog): Promise<void> {
    const { error } = await this.db
      .from("weight_logs")
      .insert({ ...toWeightRow(log), user_id: userId });
    if (error) throw error;
  }
  async removeWeightLog(userId: string, id: string): Promise<void> {
    const { error } = await this.db
      .from("weight_logs")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
    if (error) throw error;
  }

  async listMedications(userId: string): Promise<MedicationEntry[]> {
    const { data, error } = await this.db
      .from("medications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(fromMedRow);
  }
  async addMedication(userId: string, med: MedicationEntry): Promise<void> {
    const { error } = await this.db
      .from("medications")
      .insert({ ...toMedRow(med), user_id: userId });
    if (error) throw error;
  }
  async updateMedication(
    userId: string,
    id: string,
    patch: Partial<MedicationEntry>
  ): Promise<void> {
    const { error } = await this.db
      .from("medications")
      .update(toMedPatch(patch))
      .eq("id", id)
      .eq("user_id", userId);
    if (error) throw error;
  }
  async removeMedication(userId: string, id: string): Promise<void> {
    const { error } = await this.db
      .from("medications")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
    if (error) throw error;
  }

  async clearAllData(userId: string): Promise<void> {
    const tables = [
      "cycle_logs",
      "symptom_logs",
      "food_logs",
      "weight_logs",
      "medications",
    ];
    for (const table of tables) {
      const { error } = await this.db
        .from(table)
        .delete()
        .eq("user_id", userId);
      if (error) throw error;
    }
    const { error } = await this.db.from("profiles").delete().eq("id", userId);
    if (error) throw error;
  }
}

// ---------------------------------------------------------------------------
// Row <-> domain mapping. Kept in one file so the DB shape can change
// without touching call sites elsewhere in the app.
// ---------------------------------------------------------------------------

function fromProfileRow(r: any): UserProfile {
  return {
    id: r.id,
    language: r.language,
    pcosStatus: r.pcos_status,
    ageRange: r.age_range,
    goals: r.goals ?? [],
    displayName: r.display_name,
    lastPeriodStart: r.last_period_start,
    typicalCycleLengthDays: r.typical_cycle_length_days,
    typicalBleedingDays: r.typical_bleeding_days,
    cycleRegularity: r.cycle_regularity,
    heightCm: r.height_cm,
    activityLevel: r.activity_level,
    trackWeight: r.track_weight ?? false,
    onboardingCompletedAt: r.onboarding_completed_at,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}
function toProfileRow(userId: string, p: UserProfile) {
  return {
    id: userId,
    language: p.language,
    pcos_status: p.pcosStatus,
    age_range: p.ageRange,
    goals: p.goals,
    display_name: p.displayName,
    last_period_start: p.lastPeriodStart,
    typical_cycle_length_days: p.typicalCycleLengthDays,
    typical_bleeding_days: p.typicalBleedingDays,
    cycle_regularity: p.cycleRegularity,
    height_cm: p.heightCm,
    activity_level: p.activityLevel,
    track_weight: p.trackWeight,
    onboarding_completed_at: p.onboardingCompletedAt,
    created_at: p.createdAt,
    updated_at: new Date().toISOString(),
  };
}

function fromCycleRow(r: any): CycleLog {
  return {
    id: r.id,
    date: r.date,
    type: r.type,
    flow: r.flow ?? undefined,
    note: r.note ?? undefined,
    createdAt: r.created_at,
  };
}
function toCycleRow(l: CycleLog) {
  return {
    id: l.id,
    date: l.date,
    type: l.type,
    flow: l.flow ?? null,
    note: l.note ?? null,
    created_at: l.createdAt,
  };
}

function fromSymptomRow(r: any): SymptomLog {
  return {
    id: r.id,
    date: r.date,
    symptoms: r.symptoms ?? [],
    customSymptoms: r.custom_symptoms ?? undefined,
    mood: r.mood,
    sleepHours: r.sleep_hours,
    note: r.note ?? undefined,
    createdAt: r.created_at,
  };
}
function toSymptomRow(l: SymptomLog) {
  return {
    id: l.id,
    date: l.date,
    symptoms: l.symptoms,
    custom_symptoms: l.customSymptoms ?? null,
    mood: l.mood,
    sleep_hours: l.sleepHours,
    note: l.note ?? null,
    created_at: l.createdAt,
  };
}

function fromFoodRow(r: any): FoodLog {
  return {
    id: r.id,
    date: r.date,
    time: r.time,
    mealType: r.meal_type,
    items: r.items ?? [],
    note: r.note ?? undefined,
    createdAt: r.created_at,
  };
}
function toFoodRow(l: FoodLog) {
  return {
    id: l.id,
    date: l.date,
    time: l.time,
    meal_type: l.mealType,
    items: l.items,
    note: l.note ?? null,
    created_at: l.createdAt,
  };
}

function fromWeightRow(r: any): WeightLog {
  return {
    id: r.id,
    date: r.date,
    kg: Number(r.kg),
    note: r.note ?? undefined,
    createdAt: r.created_at,
  };
}
function toWeightRow(l: WeightLog) {
  return {
    id: l.id,
    date: l.date,
    kg: l.kg,
    note: l.note ?? null,
    created_at: l.createdAt,
  };
}

function fromMedRow(r: any): MedicationEntry {
  return {
    id: r.id,
    name: r.name,
    type: r.type,
    dosage: r.dosage ?? undefined,
    frequency: r.frequency ?? undefined,
    prescribedBy: r.prescribed_by ?? undefined,
    startedAt: r.started_at ?? undefined,
    active: r.active,
    note: r.note ?? undefined,
    createdAt: r.created_at,
  };
}
function toMedRow(m: MedicationEntry) {
  return {
    id: m.id,
    name: m.name,
    type: m.type,
    dosage: m.dosage ?? null,
    frequency: m.frequency ?? null,
    prescribed_by: m.prescribedBy ?? null,
    started_at: m.startedAt ?? null,
    active: m.active,
    note: m.note ?? null,
    created_at: m.createdAt,
  };
}
function toMedPatch(p: Partial<MedicationEntry>) {
  const out: Record<string, unknown> = {};
  if (p.name !== undefined) out.name = p.name;
  if (p.type !== undefined) out.type = p.type;
  if (p.dosage !== undefined) out.dosage = p.dosage;
  if (p.frequency !== undefined) out.frequency = p.frequency;
  if (p.prescribedBy !== undefined) out.prescribed_by = p.prescribedBy;
  if (p.startedAt !== undefined) out.started_at = p.startedAt;
  if (p.active !== undefined) out.active = p.active;
  if (p.note !== undefined) out.note = p.note;
  return out;
}
