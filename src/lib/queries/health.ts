"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../auth/AuthProvider";
import { getRepository } from "../data";
import { makeId } from "../id";
import type { MedicationEntry, WeightLog } from "../types";

export function useWeightLogs() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  return useQuery({
    queryKey: ["weightLogs", userId],
    queryFn: () => (userId ? getRepository().listWeightLogs(userId) : []),
    enabled: Boolean(userId),
  });
}

export function useAddWeightLog() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (log: Omit<WeightLog, "id" | "createdAt">) => {
      if (!userId) throw new Error("Not signed in");
      const full: WeightLog = {
        ...log,
        id: makeId(),
        createdAt: new Date().toISOString(),
      };
      await getRepository().addWeightLog(userId, full);
      return full;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["weightLogs", userId] }),
  });
}

export function useRemoveWeightLog() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!userId) throw new Error("Not signed in");
      await getRepository().removeWeightLog(userId, id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["weightLogs", userId] }),
  });
}

export function useMedications() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  return useQuery({
    queryKey: ["medications", userId],
    queryFn: () => (userId ? getRepository().listMedications(userId) : []),
    enabled: Boolean(userId),
  });
}

export function useAddMedication() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (med: Omit<MedicationEntry, "id" | "createdAt">) => {
      if (!userId) throw new Error("Not signed in");
      const full: MedicationEntry = {
        ...med,
        id: makeId(),
        createdAt: new Date().toISOString(),
      };
      await getRepository().addMedication(userId, full);
      return full;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["medications", userId] }),
  });
}

export function useUpdateMedication() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      patch,
    }: {
      id: string;
      patch: Partial<MedicationEntry>;
    }) => {
      if (!userId) throw new Error("Not signed in");
      await getRepository().updateMedication(userId, id, patch);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["medications", userId] }),
  });
}

export function useRemoveMedication() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!userId) throw new Error("Not signed in");
      await getRepository().removeMedication(userId, id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["medications", userId] }),
  });
}
