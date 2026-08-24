"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../auth/AuthProvider";
import { getRepository } from "../data";
import { makeId } from "../id";
import type { CycleLog } from "../types";

export function useCycleLogs() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  return useQuery({
    queryKey: ["cycleLogs", userId],
    queryFn: () => (userId ? getRepository().listCycleLogs(userId) : []),
    enabled: Boolean(userId),
  });
}

export function useAddCycleLog() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (log: Omit<CycleLog, "id" | "createdAt">) => {
      if (!userId) throw new Error("Not signed in");
      const full: CycleLog = {
        ...log,
        id: makeId(),
        createdAt: new Date().toISOString(),
      };
      await getRepository().addCycleLog(userId, full);
      return full;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cycleLogs", userId] }),
  });
}

export function useRemoveCycleLog() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!userId) throw new Error("Not signed in");
      await getRepository().removeCycleLog(userId, id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cycleLogs", userId] }),
  });
}
