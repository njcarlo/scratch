import { LocalStorageAdapter } from "../storage";
import type {
  CycleLog,
  FoodLog,
  MedicationEntry,
  SymptomLog,
  UserProfile,
  WeightLog,
} from "../types";
import type { DataRepository } from "./repository";

interface LocalBlob {
  profile: UserProfile | null;
  cycleLogs: CycleLog[];
  symptomLogs: SymptomLog[];
  foodLogs: FoodLog[];
  weightLogs: WeightLog[];
  medications: MedicationEntry[];
}

const EMPTY: LocalBlob = {
  profile: null,
  cycleLogs: [],
  symptomLogs: [],
  foodLogs: [],
  weightLogs: [],
  medications: [],
};

/**
 * Demo Mode data store — everything lives on-device in localStorage.
 *
 * This is a real, working implementation (not a fake/mock UI), it's just
 * intentionally not a secure multi-device backend. It's what the app falls
 * back to automatically when Supabase isn't configured, so the product is
 * always usable and honest about where its data lives. See the Demo Mode
 * banner in src/components/layout/DemoModeBanner.tsx.
 */
export class LocalRepository implements DataRepository {
  readonly mode = "demo" as const;
  private adapter = new LocalStorageAdapter();

  private key(userId: string) {
    return `gabay:v1:${userId}`;
  }

  private read(userId: string): LocalBlob {
    const raw = this.adapter.getItem(this.key(userId));
    if (!raw) return { ...EMPTY };
    try {
      return { ...EMPTY, ...JSON.parse(raw) };
    } catch {
      return { ...EMPTY };
    }
  }

  private write(userId: string, blob: LocalBlob) {
    this.adapter.setItem(this.key(userId), JSON.stringify(blob));
  }

  async getProfile(userId: string) {
    return this.read(userId).profile;
  }
  async saveProfile(userId: string, profile: UserProfile) {
    const blob = this.read(userId);
    blob.profile = profile;
    this.write(userId, blob);
  }

  async listCycleLogs(userId: string) {
    return [...this.read(userId).cycleLogs].sort((a, b) =>
      a.date.localeCompare(b.date)
    );
  }
  async addCycleLog(userId: string, log: CycleLog) {
    const blob = this.read(userId);
    blob.cycleLogs.push(log);
    this.write(userId, blob);
  }
  async removeCycleLog(userId: string, id: string) {
    const blob = this.read(userId);
    blob.cycleLogs = blob.cycleLogs.filter((l) => l.id !== id);
    this.write(userId, blob);
  }

  async listSymptomLogs(userId: string) {
    return [...this.read(userId).symptomLogs].sort((a, b) =>
      a.date.localeCompare(b.date)
    );
  }
  async upsertSymptomLog(userId: string, log: SymptomLog) {
    const blob = this.read(userId);
    const idx = blob.symptomLogs.findIndex((l) => l.date === log.date);
    if (idx >= 0) blob.symptomLogs[idx] = { ...blob.symptomLogs[idx], ...log };
    else blob.symptomLogs.push(log);
    this.write(userId, blob);
  }
  async removeSymptomLog(userId: string, id: string) {
    const blob = this.read(userId);
    blob.symptomLogs = blob.symptomLogs.filter((l) => l.id !== id);
    this.write(userId, blob);
  }

  async listFoodLogs(userId: string) {
    return [...this.read(userId).foodLogs].sort((a, b) =>
      (a.date + a.time).localeCompare(b.date + b.time)
    );
  }
  async addFoodLog(userId: string, log: FoodLog) {
    const blob = this.read(userId);
    blob.foodLogs.push(log);
    this.write(userId, blob);
  }
  async removeFoodLog(userId: string, id: string) {
    const blob = this.read(userId);
    blob.foodLogs = blob.foodLogs.filter((l) => l.id !== id);
    this.write(userId, blob);
  }

  async listWeightLogs(userId: string) {
    return [...this.read(userId).weightLogs].sort((a, b) =>
      a.date.localeCompare(b.date)
    );
  }
  async addWeightLog(userId: string, log: WeightLog) {
    const blob = this.read(userId);
    blob.weightLogs.push(log);
    this.write(userId, blob);
  }
  async removeWeightLog(userId: string, id: string) {
    const blob = this.read(userId);
    blob.weightLogs = blob.weightLogs.filter((l) => l.id !== id);
    this.write(userId, blob);
  }

  async listMedications(userId: string) {
    return [...this.read(userId).medications];
  }
  async addMedication(userId: string, med: MedicationEntry) {
    const blob = this.read(userId);
    blob.medications.push(med);
    this.write(userId, blob);
  }
  async updateMedication(
    userId: string,
    id: string,
    patch: Partial<MedicationEntry>
  ) {
    const blob = this.read(userId);
    blob.medications = blob.medications.map((m) =>
      m.id === id ? { ...m, ...patch } : m
    );
    this.write(userId, blob);
  }
  async removeMedication(userId: string, id: string) {
    const blob = this.read(userId);
    blob.medications = blob.medications.filter((m) => m.id !== id);
    this.write(userId, blob);
  }

  async clearAllData(userId: string) {
    this.write(userId, { ...EMPTY });
  }
}
