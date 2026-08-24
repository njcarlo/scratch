/**
 * Storage adapter — the seam between app state and where it actually lives.
 *
 * Phase 1 (MVP): everything lives on-device via `LocalStorageAdapter`. There
 * is no account system and no server, by design — it keeps the MVP simple
 * and means a user's health data never leaves their phone unless they choose
 * to export/share it (see the Healthcare "visit summary" export).
 *
 * Phase 2 extension point: implement `StorageAdapter` against
 * Firestore (auth-scoped per user) and swap it in at the single
 * call site. Screens and components only ever talk to the repository
 * (src/lib/data), never to storage directly.
 */

export interface StorageAdapter {
  getItem(name: string): string | null | Promise<string | null>;
  setItem(name: string, value: string): void | Promise<void>;
  removeItem(name: string): void | Promise<void>;
}

export class LocalStorageAdapter implements StorageAdapter {
  getItem(name: string): string | null {
    if (typeof window === "undefined") return null;
    try {
      return window.localStorage.getItem(name);
    } catch {
      // Storage can throw in private-browsing modes or when disabled.
      return null;
    }
  }

  setItem(name: string, value: string): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(name, value);
    } catch {
      // Silently ignore — logging locally isn't critical enough to crash on.
    }
  }

  removeItem(name: string): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(name);
    } catch {
      // no-op
    }
  }
}
