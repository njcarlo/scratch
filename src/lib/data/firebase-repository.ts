"use client";

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  where,
  type Firestore,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
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
 * Live backend: Cloud Firestore on the Firebase Spark (free) plan.
 * Documents live under `users/{uid}/…` so security rules can scope every
 * read/write to the signed-in user — see firestore.rules.
 *
 * Instantiated only when Firebase env vars are set (getRepository in
 * index.ts). Until then the app uses LocalRepository (Demo Mode).
 */
export class FirebaseRepository implements DataRepository {
  readonly mode = "live" as const;
  constructor(private db: Firestore) {}

  async getProfile(userId: string): Promise<UserProfile | null> {
    const snap = await getDoc(this.userDoc(userId));
    if (!snap.exists()) return null;
    return snap.data() as UserProfile;
  }

  async saveProfile(userId: string, profile: UserProfile): Promise<void> {
    await setDoc(this.userDoc(userId), stripUndefined({ ...profile, id: userId }));
  }

  async listCycleLogs(userId: string): Promise<CycleLog[]> {
    return this.listOrdered<CycleLog>(userId, "cycle_logs", "date");
  }
  async addCycleLog(userId: string, log: CycleLog): Promise<void> {
    await setDoc(this.itemDoc(userId, "cycle_logs", log.id), stripUndefined(log));
  }
  async removeCycleLog(userId: string, id: string): Promise<void> {
    await deleteDoc(this.itemDoc(userId, "cycle_logs", id));
  }

  async listSymptomLogs(userId: string): Promise<SymptomLog[]> {
    return this.listOrdered<SymptomLog>(userId, "symptom_logs", "date");
  }
  async upsertSymptomLog(userId: string, log: SymptomLog): Promise<void> {
    const snap = await getDocs(
      query(this.col(userId, "symptom_logs"), where("date", "==", log.date))
    );
    const existing = snap.docs[0];
    const id = existing?.id ?? log.id;
    const next: SymptomLog = existing
      ? { ...(existing.data() as SymptomLog), ...log, id }
      : log;
    await setDoc(this.itemDoc(userId, "symptom_logs", id), stripUndefined(next));
  }
  async removeSymptomLog(userId: string, id: string): Promise<void> {
    await deleteDoc(this.itemDoc(userId, "symptom_logs", id));
  }

  async listFoodLogs(userId: string): Promise<FoodLog[]> {
    return this.listOrdered<FoodLog>(userId, "food_logs", "date");
  }
  async addFoodLog(userId: string, log: FoodLog): Promise<void> {
    await setDoc(this.itemDoc(userId, "food_logs", log.id), stripUndefined(log));
  }
  async removeFoodLog(userId: string, id: string): Promise<void> {
    await deleteDoc(this.itemDoc(userId, "food_logs", id));
  }

  async listWeightLogs(userId: string): Promise<WeightLog[]> {
    return this.listOrdered<WeightLog>(userId, "weight_logs", "date");
  }
  async addWeightLog(userId: string, log: WeightLog): Promise<void> {
    await setDoc(this.itemDoc(userId, "weight_logs", log.id), stripUndefined(log));
  }
  async removeWeightLog(userId: string, id: string): Promise<void> {
    await deleteDoc(this.itemDoc(userId, "weight_logs", id));
  }

  async listMedications(userId: string): Promise<MedicationEntry[]> {
    return this.listOrdered<MedicationEntry>(userId, "medications", "createdAt");
  }
  async addMedication(userId: string, med: MedicationEntry): Promise<void> {
    await setDoc(this.itemDoc(userId, "medications", med.id), stripUndefined(med));
  }
  async updateMedication(
    userId: string,
    id: string,
    patch: Partial<MedicationEntry>
  ): Promise<void> {
    const snap = await getDoc(this.itemDoc(userId, "medications", id));
    if (!snap.exists()) return;
    await setDoc(
      this.itemDoc(userId, "medications", id),
      stripUndefined({ ...(snap.data() as MedicationEntry), ...patch })
    );
  }
  async removeMedication(userId: string, id: string): Promise<void> {
    await deleteDoc(this.itemDoc(userId, "medications", id));
  }

  async clearAllData(userId: string): Promise<void> {
    const names = [
      "cycle_logs",
      "symptom_logs",
      "food_logs",
      "weight_logs",
      "medications",
    ] as const;
    for (const name of names) {
      const snap = await getDocs(this.col(userId, name));
      await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
    }
    await deleteDoc(this.userDoc(userId));
  }

  private userDoc(userId: string) {
    return doc(this.db, "users", userId);
  }
  private col(userId: string, name: string) {
    return collection(this.db, "users", userId, name);
  }
  private itemDoc(userId: string, name: string, id: string) {
    return doc(this.db, "users", userId, name, id);
  }

  private async listOrdered<T>(
    userId: string,
    name: string,
    field: string
  ): Promise<T[]> {
    const snap = await getDocs(query(this.col(userId, name), orderBy(field, "asc")));
    return snap.docs.map((d: QueryDocumentSnapshot) => d.data() as T);
  }
}

/** Firestore rejects `undefined` field values. */
function stripUndefined<T extends object>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, v]) => v !== undefined)
  ) as T;
}
