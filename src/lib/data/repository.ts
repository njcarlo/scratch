import type {
  CycleLog,
  FoodLog,
  MedicationEntry,
  SymptomLog,
  UserProfile,
  WeightLog,
} from "../types";

/**
 * The single seam between the app and wherever a user's data actually
 * lives. Every screen/hook talks to a `DataRepository` — never to
 * localStorage or Firebase directly.
 *
 * Two implementations exist:
 *  - `LocalRepository`     (local-repository.ts) — on-device only, used
 *    automatically in Demo Mode when no Firebase project is configured.
 *  - `FirebaseRepository`  (firebase-repository.ts) — Cloud Firestore
 *    under `users/{uid}/…`, owner-scoped by firestore.rules.
 *
 * `getRepository()` in `index.ts` picks one at runtime. Adding a third
 * backend later means writing one more class that implements this
 * interface — nothing else in the app changes.
 */
export interface DataRepository {
  readonly mode: "demo" | "live";

  // Profile
  getProfile(userId: string): Promise<UserProfile | null>;
  saveProfile(userId: string, profile: UserProfile): Promise<void>;

  // Cycle
  listCycleLogs(userId: string): Promise<CycleLog[]>;
  addCycleLog(userId: string, log: CycleLog): Promise<void>;
  removeCycleLog(userId: string, id: string): Promise<void>;

  // Symptoms
  listSymptomLogs(userId: string): Promise<SymptomLog[]>;
  upsertSymptomLog(userId: string, log: SymptomLog): Promise<void>;
  removeSymptomLog(userId: string, id: string): Promise<void>;

  // Food
  listFoodLogs(userId: string): Promise<FoodLog[]>;
  addFoodLog(userId: string, log: FoodLog): Promise<void>;
  removeFoodLog(userId: string, id: string): Promise<void>;

  // Weight
  listWeightLogs(userId: string): Promise<WeightLog[]>;
  addWeightLog(userId: string, log: WeightLog): Promise<void>;
  removeWeightLog(userId: string, id: string): Promise<void>;

  // Medications / supplements
  listMedications(userId: string): Promise<MedicationEntry[]>;
  addMedication(userId: string, med: MedicationEntry): Promise<void>;
  updateMedication(
    userId: string,
    id: string,
    patch: Partial<MedicationEntry>
  ): Promise<void>;
  removeMedication(userId: string, id: string): Promise<void>;

  // Account-level
  clearAllData(userId: string): Promise<void>;
}
