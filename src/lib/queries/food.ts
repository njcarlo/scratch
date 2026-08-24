"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../auth/AuthProvider";
import { getRepository } from "../data";
import { makeId } from "../id";
import type { FoodLog } from "../types";

export function useFoodLogs() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  return useQuery({
    queryKey: ["foodLogs", userId],
    queryFn: () => (userId ? getRepository().listFoodLogs(userId) : []),
    enabled: Boolean(userId),
  });
}

export function useAddFoodLog() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (log: Omit<FoodLog, "id" | "createdAt">) => {
      if (!userId) throw new Error("Not signed in");
      const full: FoodLog = {
        ...log,
        id: makeId(),
        createdAt: new Date().toISOString(),
      };
      await getRepository().addFoodLog(userId, full);
      return full;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["foodLogs", userId] }),
  });
}

export function useRemoveFoodLog() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!userId) throw new Error("Not signed in");
      await getRepository().removeFoodLog(userId, id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["foodLogs", userId] }),
  });
}
