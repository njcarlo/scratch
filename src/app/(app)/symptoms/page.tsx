"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { DisclaimerBanner } from "@/components/ui/DisclaimerBanner";
import { useT } from "@/lib/i18n";
import { useSymptomLogs, useUpsertSymptomLog } from "@/lib/queries/symptoms";
import { todayISO } from "@/lib/dates";
import { SEEK_CARE_HINTS } from "@/lib/safety";
import type { MoodLevel, Severity, SymptomKey } from "@/lib/types";
import {
  SYMPTOM_CATEGORY_OF,
} from "@/lib/types";

const ALL_SYMPTOMS = Object.keys(SYMPTOM_CATEGORY_OF) as SymptomKey[];
const SEVERITIES: Severity[] = [1, 2, 3];
const MOODS: MoodLevel[] = [1, 2, 3, 4, 5];

export default function SymptomsPage() {
  const t = useT();
  const router = useRouter();
  const { data: symptomLogs = [] } = useSymptomLogs();
  const upsert = useUpsertSymptomLog();

  const date = todayISO();
  const existing = symptomLogs.find((l) => l.date === date);

  const [entries, setEntries] = useState<Partial<Record<SymptomKey, Severity>>>({});
  const [mood, setMood] = useState<MoodLevel | null>(null);
  const [sleepHours, setSleepHours] = useState("");

  useEffect(() => {
    // One-time sync of local form state from today's already-saved entry
    // (an external system — React Query's cache), not a subscription.
    if (!existing) return;
    const map: Partial<Record<SymptomKey, Severity>> = {};
    for (const s of existing.symptoms) map[s.key] = s.severity;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEntries(map);
    setMood(existing.mood);
    setSleepHours(existing.sleepHours != null ? String(existing.sleepHours) : "");
  }, [existing]);

  function toggle(key: SymptomKey) {
    setEntries((e) => {
      const next = { ...e };
      if (next[key] != null) delete next[key];
      else next[key] = 2;
      return next;
    });
  }

  function setSeverity(key: SymptomKey, severity: Severity) {
    setEntries((e) => ({ ...e, [key]: severity }));
  }

  const flaggedHints = Object.entries(entries)
    .map(([key]) => SEEK_CARE_HINTS[key])
    .filter(Boolean) as string[];

  async function save() {
    await upsert.mutateAsync({
      id: existing?.id,
      date,
      symptoms: Object.entries(entries).map(([key, severity]) => ({
        key: key as SymptomKey,
        severity: severity as Severity,
      })),
      mood,
      sleepHours: sleepHours ? Number(sleepHours) : null,
    });
    router.push("/home");
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-ink-900">{t("symptoms.title")}</h1>
      <DisclaimerBanner stringKey="safety.general" />

      <Card>
        <h2 className="mb-2 text-sm font-semibold text-ink-800">
          {t("symptoms.mood")}
        </h2>
        <div className="flex gap-2">
          {MOODS.map((m) => (
            <Chip key={m} selected={mood === m} onClick={() => setMood(m)}>
              {t(`mood.${m}`)}
            </Chip>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="mb-2 text-sm font-semibold text-ink-800">
          {t("symptoms.sleepHours")}
        </h2>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          max={16}
          step={0.5}
          value={sleepHours}
          onChange={(e) => setSleepHours(e.target.value)}
          className="w-24 rounded-xl2 border border-ink-100 bg-white px-4 py-2.5 text-[15px]"
        />
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-semibold text-ink-800">
          {t("symptoms.sectionTitle")}
        </h2>
        <div className="flex flex-wrap gap-2">
          {ALL_SYMPTOMS.map((key) => (
            <Chip key={key} selected={entries[key] != null} onClick={() => toggle(key)}>
              {t(`symptom.${key}`)}
            </Chip>
          ))}
        </div>

        {Object.keys(entries).length > 0 && (
          <div className="mt-4 flex flex-col gap-3 border-t border-ink-50 pt-4">
            {(Object.keys(entries) as SymptomKey[]).map((key) => (
              <div key={key} className="flex items-center justify-between gap-2">
                <span className="text-sm text-ink-700">{t(`symptom.${key}`)}</span>
                <div className="flex gap-1">
                  {SEVERITIES.map((sev) => (
                    <button
                      key={sev}
                      onClick={() => setSeverity(key, sev)}
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        entries[key] === sev
                          ? "bg-teal-600 text-white"
                          : "bg-cream-100 text-ink-500"
                      }`}
                    >
                      {t(`severity.${sev}`)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {flaggedHints.length > 0 && (
        <Card className="border-blush-200 bg-blush-50">
          {flaggedHints.map((hint, i) => (
            <p key={i} className="text-[13px] leading-snug text-blush-800">
              {hint}
            </p>
          ))}
        </Card>
      )}

      <Button onClick={save} disabled={upsert.isPending} fullWidth>
        {t("symptoms.save")}
      </Button>
    </div>
  );
}
