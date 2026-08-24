"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/Card";
import { InfoTierBadge } from "@/components/ui/InfoTierBadge";
import { DisclaimerBanner } from "@/components/ui/DisclaimerBanner";
import { useT } from "@/lib/i18n";
import { useCycleLogs } from "@/lib/queries/cycle";
import { useSymptomLogs } from "@/lib/queries/symptoms";
import { useFoodLogs } from "@/lib/queries/food";
import { useWeightLogs } from "@/lib/queries/health";
import { useProfile } from "@/lib/queries/profile";
import {
  cycleLengths,
  foodPatternShares,
  moodSeries,
  symptomFrequency,
  weightTrend,
} from "@/lib/insights";

const TEAL = "#2E7C6F";
const MANGO = "#E0921A";

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <h2 className="text-sm font-semibold text-ink-800">{title}</h2>
      <InfoTierBadge tier="personal" />
    </div>
  );
}

export default function InsightsPage() {
  const t = useT();
  const { data: profile } = useProfile();
  const { data: cycleLogs = [] } = useCycleLogs();
  const { data: symptomLogs = [] } = useSymptomLogs();
  const { data: foodLogs = [] } = useFoodLogs();
  const { data: weightLogs = [] } = useWeightLogs();

  const lengths = cycleLengths(cycleLogs);
  const cycleChartData = lengths.map((len, i) => ({ name: `#${i + 1}`, days: len }));
  const symptoms = symptomFrequency(symptomLogs, 30).slice(0, 6);
  const mood = moodSeries(symptomLogs, 30);
  const weight = weightTrend(weightLogs);
  const foodShares = foodPatternShares(foodLogs, 30);
  const maxSymptomCount = Math.max(1, ...symptoms.map((s) => s.count));

  return (
    <div className="flex flex-col gap-4">
      <DisclaimerBanner stringKey="safety.insights" />

      <Card>
        <SectionHeader title={t("insights.cycleTrend")} />
        {cycleChartData.length > 0 ? (
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cycleChartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#EDEBE7" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={11} stroke="#8A8378" />
                <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="#8A8378" width={28} />
                <Tooltip
                  cursor={{ fill: "#EFFAF8" }}
                  contentStyle={{ borderRadius: 12, border: "1px solid #EDEBE7", fontSize: 12 }}
                />
                <Bar dataKey="days" fill={TEAL} radius={[4, 4, 0, 0]} maxBarSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-ink-500">{t("insights.notEnoughData")}</p>
        )}
      </Card>

      <Card>
        <SectionHeader title={t("insights.symptomFrequency")} />
        {symptoms.length > 0 ? (
          <ul className="flex flex-col gap-2.5">
            {symptoms.map((s) => (
              <li key={s.key}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-ink-700">{t(`symptom.${s.key}`)}</span>
                  <span className="text-ink-400">{s.count}</span>
                </div>
                <div className="h-1.5 rounded-full bg-ink-50">
                  <div
                    className="h-1.5 rounded-full bg-teal-600"
                    style={{ width: `${(s.count / maxSymptomCount) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-500">{t("insights.notEnoughData")}</p>
        )}
      </Card>

      <Card>
        <SectionHeader title={t("insights.moodTrend")} />
        {mood.length > 1 ? (
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mood} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#EDEBE7" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={10} stroke="#8A8378" hide />
                <YAxis domain={[1, 5]} tickLine={false} axisLine={false} fontSize={11} stroke="#8A8378" width={20} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #EDEBE7", fontSize: 12 }} />
                <Line type="monotone" dataKey="mood" stroke={MANGO} strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-ink-500">{t("insights.notEnoughData")}</p>
        )}
      </Card>

      {profile?.trackWeight && (
        <Card>
          <SectionHeader title={t("insights.weightTrend")} />
          {weight && weight.points.length > 1 ? (
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weight.points} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#EDEBE7" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={10} stroke="#8A8378" hide />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="#8A8378" width={28} domain={["auto", "auto"]} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #EDEBE7", fontSize: 12 }} />
                  <Line type="monotone" dataKey="kg" stroke={TEAL} strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-ink-500">{t("insights.notEnoughData")}</p>
          )}
        </Card>
      )}

      <Card>
        <SectionHeader title={t("insights.foodPatterns")} />
        {foodShares ? (
          <div className="flex flex-col gap-2 text-sm text-ink-700">
            <p>{t("insights.riceHeavyShare", { pct: foodShares.riceHeavyPct })}</p>
            <p>{t("insights.friedShare", { pct: foodShares.friedPct })}</p>
            <p>{t("insights.vegShare", { pct: foodShares.vegForwardPct })}</p>
          </div>
        ) : (
          <p className="text-sm text-ink-500">{t("insights.notEnoughData")}</p>
        )}
      </Card>
    </div>
  );
}
