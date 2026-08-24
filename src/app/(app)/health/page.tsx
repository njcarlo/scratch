"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TrashIcon } from "@/components/icons";
import { useT } from "@/lib/i18n";
import { useProfile } from "@/lib/queries/profile";
import { useAddWeightLog, useMedications, useRemoveWeightLog, useWeightLogs } from "@/lib/queries/health";
import { formatFriendlyDate, todayISO } from "@/lib/dates";

export default function HealthPage() {
  const t = useT();
  const { data: profile } = useProfile();
  const { data: weightLogs = [] } = useWeightLogs();
  const { data: medications = [] } = useMedications();
  const addWeight = useAddWeightLog();
  const removeWeight = useRemoveWeightLog();

  const [kg, setKg] = useState("");
  const sortedWeights = [...weightLogs].sort((a, b) => b.date.localeCompare(a.date));

  async function logWeight() {
    const value = Number(kg);
    if (!value || value <= 0) return;
    await addWeight.mutateAsync({ date: todayISO(), kg: value });
    setKg("");
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <h2 className="mb-2 text-sm font-semibold text-ink-800">
          {t("health.weight.title")}
        </h2>
        {profile?.trackWeight ? (
          <>
            <div className="flex gap-2">
              <input
                type="number"
                inputMode="decimal"
                step={0.1}
                placeholder={t("common.kg")}
                value={kg}
                onChange={(e) => setKg(e.target.value)}
                className="flex-1 rounded-xl2 border border-ink-100 bg-white px-4 py-2.5 text-[15px]"
              />
              <Button onClick={logWeight} disabled={addWeight.isPending}>
                {t("health.weight.logCta")}
              </Button>
            </div>
            <div className="mt-3">
              {sortedWeights.length === 0 ? (
                <p className="text-sm text-ink-500">{t("health.weight.empty")}</p>
              ) : (
                <ul className="flex flex-col gap-1.5">
                  {sortedWeights.slice(0, 10).map((w) => (
                    <li
                      key={w.id}
                      className="flex items-center justify-between rounded-lg bg-cream-100 px-3 py-2 text-sm"
                    >
                      <span className="text-ink-700">
                        {formatFriendlyDate(w.date)} — {w.kg} {t("common.kg")}
                      </span>
                      <button
                        onClick={() => removeWeight.mutate(w.id)}
                        aria-label={t("common.delete")}
                      >
                        <TrashIcon className="h-4 w-4 text-ink-400 hover:text-blush-600" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        ) : (
          <div>
            <p className="text-sm font-medium text-ink-700">
              {t("health.weight.disabledTitle")}
            </p>
            <p className="mt-1 text-sm text-ink-500">
              {t("health.weight.disabledBody")}
            </p>
            <Link href="/profile" className="mt-3 inline-block text-sm font-medium text-teal-700">
              {t("profile.title")}
            </Link>
          </div>
        )}
      </Card>

      <Card>
        <h2 className="mb-2 text-sm font-semibold text-ink-800">
          {t("health.meds.title")}
        </h2>
        {medications.length === 0 ? (
          <p className="text-sm text-ink-500">{t("health.meds.empty")}</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {medications.map((m) => (
              <li key={m.id} className="rounded-lg bg-cream-100 px-3 py-2 text-sm text-ink-700">
                <span className="font-medium">{m.name}</span>
                {m.dosage ? ` — ${m.dosage}` : ""}
                {m.frequency ? ` · ${m.frequency}` : ""}
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-xs leading-relaxed text-ink-400">
          {t("health.meds.phase2")}
        </p>
      </Card>

      <Card>
        <h2 className="mb-2 text-sm font-semibold text-ink-800">
          {t("health.labs.title")}
        </h2>
        <p className="text-sm text-ink-500">{t("health.labs.phase2")}</p>
      </Card>
    </div>
  );
}
