"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../auth/AuthProvider";
import { getRepository } from "../data";
import type { UserProfile } from "../types";

export function emptyProfile(userId: string): UserProfile {
  const now = new Date().toISOString();
  return {
    id: userId,
    language: "en",
    pcosStatus: null,
    ageRange: null,
    goals: [],
    displayName: null,
    lastPeriodStart: null,
    typicalCycleLengthDays: null,
    typicalBleedingDays: null,
    cycleRegularity: null,
    heightCm: null,
    activityLevel: null,
    trackWeight: false,
    onboardingCompletedAt: null,
    createdAt: now,
    updatedAt: now,
  };
}

export function useProfile() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      if (!userId) return null;
      const existing = await getRepository().getProfile(userId);
      return existing ?? emptyProfile(userId);
    },
    enabled: Boolean(userId),
  });
}

export function useSaveProfile() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<UserProfile>) => {
      if (!userId) throw new Error("Not signed in");
      const current =
        (await getRepository().getProfile(userId)) ?? emptyProfile(userId);
      const next: UserProfile = {
        ...current,
        ...patch,
        id: userId,
        updatedAt: new Date().toISOString(),
      };
      await getRepository().saveProfile(userId, next);
      return next;
    },
    onSuccess: (next) => {
      qc.setQueryData(["profile", userId], next);
    },
  });
}
