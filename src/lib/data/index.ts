import { isSupabaseConfigured, getSupabaseClient } from "../supabase/client";
import { LocalRepository } from "./local-repository";
import { SupabaseRepository } from "./supabase-repository";
import type { DataRepository } from "./repository";

export type { DataRepository } from "./repository";

let repo: DataRepository | null = null;

/**
 * The one place in the app that decides Demo Mode vs. live Supabase.
 * Everything else (React Query hooks in src/lib/queries/*) just calls
 * `getRepository()` and doesn't care which one it got.
 */
export function getRepository(): DataRepository {
  if (repo) return repo;
  if (isSupabaseConfigured) {
    const client = getSupabaseClient();
    if (client) {
      repo = new SupabaseRepository(client);
      return repo;
    }
  }
  repo = new LocalRepository();
  return repo;
}
