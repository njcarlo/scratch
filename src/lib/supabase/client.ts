"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Whether a real Supabase project is configured for this deployment.
 * The whole app (data repository + auth) branches on this single flag —
 * see src/lib/data/index.ts and src/lib/auth/*.
 */
export const isSupabaseConfigured = Boolean(url && anonKey);

let client: SupabaseClient | null = null;

/**
 * Returns a singleton Supabase client, or `null` if the project isn't
 * configured (Demo Mode). Callers must check `isSupabaseConfigured` (or a
 * null return) before using this — we never throw here, since Demo Mode is
 * a fully supported, expected state, not an error.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!client) {
    client = createClient(url as string, anonKey as string, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
  }
  return client;
}
