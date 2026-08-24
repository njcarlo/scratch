import { daysBetween, isWithinLastNDays, todayISO } from "./dates";
import { getFoodById } from "./data/food-service";
import type { CycleLog, FoodLog, SymptomKey, SymptomLog, WeightLog } from "./types";

/**
 * All functions here are pure, deterministic, descriptive statistics over
 * whatever the user has logged — no ML, no external calls, no causal
 * claims. This is what powers Home's "From your data" card and the
 * Insights screen. See DisclaimerBanner / INSIGHTS_DISCLAIMER for the
 * framing every caller must show alongside these numbers.
 */

export function periodStartDates(cycleLogs: CycleLog[]): string[] {
  return cycleLogs
    .filter((l) => l.type === "period_start")
    .map((l) => l.date)
    .sort();
}

export function cycleLengths(cycleLogs: CycleLog[]): number[] {
  const starts = periodStartDates(cycleLogs);
  const lengths: number[] = [];
  for (let i = 1; i < starts.length; i++) {
    lengths.push(daysBetween(starts[i - 1], starts[i]));
  }
  return lengths;
}

export interface CycleStats {
  average: number;
  shortest: number;
  longest: number;
  count: number;
}

export function cycleStats(lengths: number[]): CycleStats | null {
  if (lengths.length === 0) return null;
  const sum = lengths.reduce((a, b) => a + b, 0);
  return {
    average: Math.round(sum / lengths.length),
    shortest: Math.min(...lengths),
    longest: Math.max(...lengths),
    count: lengths.length,
  };
}

/** Day 1 = most recent logged period start. Null if nothing logged. */
export function currentCycleDay(cycleLogs: CycleLog[]): number | null {
  const starts = periodStartDates(cycleLogs);
  if (starts.length === 0) return null;
  const last = starts[starts.length - 1];
  return daysBetween(last, todayISO()) + 1;
}

export interface SymptomFrequencyRow {
  key: SymptomKey;
  count: number;
}

export function symptomFrequency(
  symptomLogs: SymptomLog[],
  days = 30
): SymptomFrequencyRow[] {
  const counts = new Map<SymptomKey, number>();
  for (const log of symptomLogs) {
    if (!isWithinLastNDays(log.date, days)) continue;
    for (const s of log.symptoms) {
      if (s.severity === 0) continue;
      counts.set(s.key, (counts.get(s.key) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count);
}

export interface WeightTrend {
  latestKg: number;
  firstKg: number;
  deltaKg: number;
  points: { date: string; kg: number }[];
}

export function weightTrend(weightLogs: WeightLog[]): WeightTrend | null {
  if (weightLogs.length === 0) return null;
  const sorted = [...weightLogs].sort((a, b) => a.date.localeCompare(b.date));
  const first = sorted[0].kg;
  const latest = sorted[sorted.length - 1].kg;
  return {
    latestKg: latest,
    firstKg: first,
    deltaKg: Math.round((latest - first) * 10) / 10,
    points: sorted.map((l) => ({ date: l.date, kg: l.kg })),
  };
}

export interface FoodPatternShares {
  totalMeals: number;
  riceHeavyPct: number;
  friedPct: number;
  vegForwardPct: number;
}

export function foodPatternShares(foodLogs: FoodLog[], days = 30): FoodPatternShares | null {
  const recent = foodLogs.filter((l) => isWithinLastNDays(l.date, days));
  if (recent.length === 0) return null;
  let rice = 0;
  let fried = 0;
  let veg = 0;
  for (const log of recent) {
    const tags = new Set(
      log.items.flatMap((item) => {
        const food = item.foodId ? getFoodById(item.foodId) : undefined;
        return food?.tags ?? [];
      })
    );
    if (tags.has("rice_heavy") || tags.has("refined_carb")) rice++;
    if (tags.has("fried")) fried++;
    if (tags.has("vegetable_forward") || tags.has("high_fiber")) veg++;
  }
  const pct = (n: number) => Math.round((n / recent.length) * 100);
  return {
    totalMeals: recent.length,
    riceHeavyPct: pct(rice),
    friedPct: pct(fried),
    vegForwardPct: pct(veg),
  };
}

/** Mood entries as a simple time series for the last N days, most recent last. */
export function moodSeries(symptomLogs: SymptomLog[], days = 30) {
  return symptomLogs
    .filter((l) => isWithinLastNDays(l.date, days) && l.mood != null)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((l) => ({ date: l.date, mood: l.mood as number }));
}
