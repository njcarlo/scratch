"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../auth/AuthProvider";
import { getRepository } from "../data";

export function useClearAllData() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("Not signed in");
      await getRepository().clearAllData(userId);
    },
    onSuccess: () => qc.invalidateQueries(),
  });
}

/** Gathers everything the repository holds for this user into one plain object. */
export async function exportAllData(userId: string) {
  const repo = getRepository();
  const [profile, cycleLogs, symptomLogs, foodLogs, weightLogs, medications] =
    await Promise.all([
      repo.getProfile(userId),
      repo.listCycleLogs(userId),
      repo.listSymptomLogs(userId),
      repo.listFoodLogs(userId),
      repo.listWeightLogs(userId),
      repo.listMedications(userId),
    ]);
  return {
    exportedAt: new Date().toISOString(),
    profile,
    cycleLogs,
    symptomLogs,
    foodLogs,
    weightLogs,
    medications,
  };
}
