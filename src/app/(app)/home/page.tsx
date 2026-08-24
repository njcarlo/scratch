"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { InfoTierBadge } from "@/components/ui/InfoTierBadge";
import { DisclaimerBanner } from "@/components/ui/DisclaimerBanner";
import { DropletIcon, FoodIcon, PillIcon, ScaleIcon } from "@/components/icons";
import { useT } from "@/lib/i18n";
import { useProfile } from "@/lib/queries/profile";
import { useCycleLogs } from "@/lib/queries/cycle";
import { useSymptomLogs } from "@/lib/queries/symptoms";
import { useFoodLogs } from "@/lib/queries/food";
import { useMedications, useWeightLogs } from "@/lib/queries/health";
import {
  cycleLengths,
  cycleStats,
  currentCycleDay,
  symptomFrequency,
} from "@/lib/insights";
import { todayISO } from "@/lib/dates";
import { getFoodById } from "@/lib/data/food-service";

export default function HomePage() {
  const t = useT();
  const { data: profile } = useProfile();
  const { data: cycleLogs = [] } = useCycleLogs();
  const { data: symptomLogs = [] } = useSymptomLogs();
  const { data: foodLogs = [] } = useFoodLogs();
  const { data: weightLogs = [] } = useWeightLogs();
  const { data: medications = [] } = useMedications();

  const cycleDay = currentCycleDay(cycleLogs);
  const stats = cycleStats(cycleLengths(cycleLogs));
  const today = todayISO();
  const todayFood = foodLogs.filter((l) => l.date === today);
  const todayCheckedIn = symptomLogs.some((l) => l.date === today);
  const activeMeds = medications.filter((m) => m.active);
  const topSymptoms = symptomFrequency(symptomLogs, 30).slice(0, 2);
  const latestWeight = [...weightLogs].sort((a, b) =>
    b.date.localeCompare(a.date)
  )[0];

  return (
    <div className="flex flex-col gap-4">
      <DisclaimerBanner stringKey="safety.general" />

      {/* Cycle */}
      <Card>
        <div className="flex items-center gap-2 text-teal-700">
          <DropletIcon className="h-4 w-4" />
          <h2 className="text-sm font-semibold">{t("home.cycle.title")}</h2>
        </div>
        {cycleDay ? (
          <p className="mt-1 text-3xl font-semibold text-ink-900">
            {t("home.cycle.day", { n: cycleDay })}
          </p>
        ) : (
          <p className="mt-1 text-sm text-ink-500">{t("home.cycle.noData")}</p>
        )}
        {stats && (
          <p className="mt-1 text-xs text-ink-400">
            {t("home.cycle.range", { min: stats.shortest, max: stats.longest })}
          </p>
        )}
        <Link href="/cycle" className="mt-3 inline-block">
          <Button variant="secondary">{t("cycle.logPeriod")}</Button>
        </Link>
      </Card>

      {/* Check-in */}
      <Card>
        <h2 className="text-sm font-semibold text-ink-800">
          {t("home.checkin.title")}
        </h2>
        <Link href="/symptoms" className="mt-3 inline-block">
          <Button variant={todayCheckedIn ? "secondary" : "primary"}>
            {todayCheckedIn ? t("home.checkin.done") : t("home.checkin.cta")}
          </Button>
        </Link>
      </Card>

      {/* Weight (only if opted in) */}
      {profile?.trackWeight && (
        <Card>
          <div className="flex items-center gap-2 text-teal-700">
            <ScaleIcon className="h-4 w-4" />
            <h2 className="text-sm font-semibold">{t("home.weight.title")}</h2>
          </div>
          {latestWeight ? (
            <p className="mt-1 text-2xl font-semibold text-ink-900">
              {latestWeight.kg} {t("common.kg")}
            </p>
          ) : (
            <p className="mt-1 text-sm text-ink-500">{t("common.noneYet")}</p>
          )}
          <Link href="/health" className="mt-3 inline-block">
            <Button variant="secondary">{t("home.weight.cta")}</Button>
          </Link>
        </Card>
      )}

      {/* Food */}
      <Card>
        <div className="flex items-center gap-2 text-teal-700">
          <FoodIcon className="h-4 w-4" />
          <h2 className="text-sm font-semibold">{t("home.food.title")}</h2>
        </div>
        {todayFood.length === 0 ? (
          <p className="mt-1 text-sm text-ink-500">{t("home.food.empty")}</p>
        ) : (
          <ul className="mt-2 flex flex-col gap-1">
            {todayFood.map((log) => (
              <li key={log.id} className="text-sm text-ink-700">
                {log.items
                  .map((i) => i.customName ?? getFoodById(i.foodId ?? "")?.name)
                  .filter(Boolean)
                  .join(", ")}
              </li>
            ))}
          </ul>
        )}
        <Link href="/food" className="mt-3 inline-block">
          <Button variant="secondary">{t("home.food.cta")}</Button>
        </Link>
      </Card>

      {/* Medications */}
      <Card>
        <div className="flex items-center gap-2 text-teal-700">
          <PillIcon className="h-4 w-4" />
          <h2 className="text-sm font-semibold">{t("home.meds.title")}</h2>
        </div>
        {activeMeds.length === 0 ? (
          <p className="mt-1 text-sm text-ink-500">{t("home.meds.empty")}</p>
        ) : (
          <ul className="mt-2 flex flex-col gap-1">
            {activeMeds.map((m) => (
              <li key={m.id} className="text-sm text-ink-700">
                {m.name}
                {m.dosage ? ` — ${m.dosage}` : ""}
              </li>
            ))}
          </ul>
        )}
        <Link
          href="/health"
          className="mt-3 inline-block text-sm font-medium text-teal-700"
        >
          {t("home.meds.manage")}
        </Link>
      </Card>

      {/* Insight */}
      <Card>
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink-800">
            {t("home.insight.title")}
          </h2>
          <InfoTierBadge tier="personal" />
        </div>
        {topSymptoms.length === 0 ? (
          <p className="text-sm text-ink-500">{t("home.insight.empty")}</p>
        ) : (
          <p className="text-sm text-ink-700">
            {t("home.insight.topSymptoms", {
              list: topSymptoms.map((s) => t(`symptom.${s.key}`)).join(", "),
            })}
          </p>
        )}
      </Card>
    </div>
  );
}
