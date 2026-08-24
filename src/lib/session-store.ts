"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { LocalStorageAdapter } from "./storage";
import type { Language } from "./types";

/**
 * Small, transient/UI-only state — current language and where the user is
 * in the onboarding wizard. Actual health data never lives here; it goes
 * through the DataRepository (src/lib/data) via React Query hooks instead.
 */
interface SessionState {
  language: Language;
  setLanguage: (l: Language) => void;
  onboardingStep: number;
  setOnboardingStep: (n: number) => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      language: "en",
      setLanguage: (language) => set({ language }),
      onboardingStep: 0,
      setOnboardingStep: (onboardingStep) => set({ onboardingStep }),
    }),
    {
      name: "gabay-session",
      storage: createJSONStorage(() => new LocalStorageAdapter()),
    }
  )
);
