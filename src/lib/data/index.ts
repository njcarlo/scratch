"use client";

import { isFirebaseConfigured, getFirebaseDb } from "../firebase/client";
import { LocalRepository } from "./local-repository";
import { FirebaseRepository } from "./firebase-repository";
import type { DataRepository } from "./repository";

export type { DataRepository } from "./repository";

let repo: DataRepository | null = null;

/**
 * The one place in the app that decides Demo Mode vs. live Firebase.
 * Everything else (React Query hooks in src/lib/queries/*) just calls
 * `getRepository()` and doesn't care which one it got.
 */
export function getRepository(): DataRepository {
  if (repo) return repo;
  if (isFirebaseConfigured) {
    const db = getFirebaseDb();
    if (db) {
      repo = new FirebaseRepository(db);
      return repo;
    }
  }
  repo = new LocalRepository();
  return repo;
}
