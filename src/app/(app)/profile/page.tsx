"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { useT, useLanguage } from "@/lib/i18n";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useProfile, useSaveProfile } from "@/lib/queries/profile";
import { useClearAllData, exportAllData } from "@/lib/queries/settings";
import { pcosStatusLabel } from "@/lib/safety";
import type { Goal, PCOSStatus } from "@/lib/types";

const STATUS_OPTIONS: PCOSStatus[] = [
  "diagnosed",
  "suspected",
  "evaluating",
  "not_sure",
  "learning",
];
const GOAL_OPTIONS: Goal[] = [
  "understand_cycle",
  "manage_symptoms",
  "lose_weight",
  "maintain_weight",
  "improve_eating",
  "improve_energy",
  "track_medication",
  "track_supplements",
  "prep_for_doctor",
  "fertility_awareness",
  "understand_pcos",
];

export default function ProfilePage() {
  const t = useT();
  const { language, setLanguage } = useLanguage();
  const { user, isDemo } = useAuth();
  const { data: profile } = useProfile();
  const saveProfile = useSaveProfile();
  const clearAllData = useClearAllData();
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    if (!user) return;
    setExporting(true);
    try {
      const data = await exportAllData(user.id);
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gabay-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  function handleDelete() {
    if (!window.confirm(t("profile.deleteConfirm"))) return;
    clearAllData.mutate();
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-ink-900">{t("profile.title")}</h1>

      {isDemo && (
        <Card className="border-mango-300 bg-mango-100">
          <h2 className="text-sm font-semibold text-ink-800">
            {t("profile.demoModeTitle")}
          </h2>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-700">
            {t("profile.demoModeBody")}
          </p>
        </Card>
      )}

      <Card>
        <h2 className="mb-2 text-sm font-semibold text-ink-800">
          {t("profile.language")}
        </h2>
        <div className="flex gap-2">
          <Chip
            selected={language === "en"}
            onClick={() => {
              setLanguage("en");
              saveProfile.mutate({ language: "en" });
            }}
          >
            {t("onboarding.welcome.languageEn")}
          </Chip>
          <Chip
            selected={language === "tl-en"}
            onClick={() => {
              setLanguage("tl-en");
              saveProfile.mutate({ language: "tl-en" });
            }}
          >
            {t("onboarding.welcome.languageTaglish")}
          </Chip>
        </div>
      </Card>

      <Card>
        <h2 className="mb-2 text-sm font-semibold text-ink-800">
          {t("profile.pcosStatus")}
        </h2>
        <p className="mb-2 text-xs text-ink-400">
          {pcosStatusLabel(profile?.pcosStatus ?? null)}
        </p>
        <div className="flex flex-col gap-2">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => saveProfile.mutate({ pcosStatus: s })}
              className={`rounded-xl2 border px-4 py-3 text-left text-sm font-medium ${
                profile?.pcosStatus === s
                  ? "border-teal-600 bg-teal-50 text-teal-800"
                  : "border-ink-100 bg-white text-ink-800"
              }`}
            >
              {t(`onboarding.status.${s}`)}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="mb-2 text-sm font-semibold text-ink-800">
          {t("profile.goals")}
        </h2>
        <div className="flex flex-wrap gap-2">
          {GOAL_OPTIONS.map((g) => {
            const selected = profile?.goals?.includes(g) ?? false;
            return (
              <Chip
                key={g}
                selected={selected}
                onClick={() => {
                  const goals = profile?.goals ?? [];
                  saveProfile.mutate({
                    goals: selected
                      ? goals.filter((x) => x !== g)
                      : [...goals, g],
                  });
                }}
              >
                {t(`onboarding.goals.${g}`)}
              </Chip>
            );
          })}
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-ink-700">
            {t("profile.trackWeight")}
          </span>
          <button
            role="switch"
            aria-checked={profile?.trackWeight ?? false}
            onClick={() =>
              saveProfile.mutate({ trackWeight: !(profile?.trackWeight ?? false) })
            }
            className={`h-7 w-12 shrink-0 rounded-full transition-colors ${
              profile?.trackWeight ? "bg-teal-600" : "bg-ink-100"
            }`}
          >
            <span
              className={`block h-6 w-6 rounded-full bg-white shadow transition-transform ${
                profile?.trackWeight ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-semibold text-ink-800">
          {t("profile.dataSection")}
        </h2>
        <div className="flex flex-col gap-2">
          <Button variant="secondary" onClick={handleExport} disabled={exporting} fullWidth>
            {t("profile.exportData")}
          </Button>
          <Button variant="danger" onClick={handleDelete} fullWidth>
            {t("profile.deleteData")}
          </Button>
        </div>
      </Card>

      <Card>
        <h2 className="mb-1 text-sm font-semibold text-ink-800">
          {t("profile.about")}
        </h2>
        <p className="text-[13px] leading-relaxed text-ink-500">
          {t("profile.aboutBody")}
        </p>
      </Card>
    </div>
  );
}
