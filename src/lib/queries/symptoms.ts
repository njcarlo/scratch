"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../auth/AuthProvider";
import { getRepository } from "../data";
import { makeId } from "../id";
import type { SymptomLog } from "../types";

export function useSymptomLogs() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  return useQuery({
    queryKey: ["symptomLogs", userId],
    queryFn: () => (userId ? getRepository().listSymptomLogs(userId) : []),
    enabled: Boolean(userId),
  });
}

/** Insert or update the single symptom log for `log.date`. */
export function useUpsertSymptomLog() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      log: Omit<SymptomLog, "id" | "createdAt"> & { id?: string }
    ) => {
      if (!userId) throw new Error("Not signed in");
      const full: SymptomLog = {
        ...log,
        id: log.id ?? makeId(),
        createdAt: new Date().toISOString(),
      };
      await getRepository().upsertSymptomLog(userId, full);
      return full;
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["symptomLogs", userId] }),
  });
}

export function useRemoveSymptomLog() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!userId) throw new Error("Not signed in");
      await getRepository().removeSymptomLog(userId, id);
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["symptomLogs", userId] }),
  });
}
