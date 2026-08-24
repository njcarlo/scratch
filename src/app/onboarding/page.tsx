"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { PlusIcon, TrashIcon } from "@/components/icons";
import { useT, useLanguage } from "@/lib/i18n";
import { useSessionStore } from "@/lib/session-store";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useSaveProfile } from "@/lib/queries/profile";
import { useUpsertSymptomLog } from "@/lib/queries/symptoms";
import { useAddMedication } from "@/lib/queries/health";
import { todayISO } from "@/lib/dates";
import type {
  ActivityLevel,
  CycleRegularity,
  Goal,
  MedType,
  PCOSStatus,
  SymptomKey,
} from "@/lib/types";

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

const SYMPTOM_OPTIONS: SymptomKey[] = [
  "acne",
  "hair_growth",
  "hair_thinning",
  "fatigue",
  "bloating",
  "cramps",
  "cravings",
  "headache",
  "mood_swings",
  "anxiety",
  "sleep_trouble",
  "pelvic_discomfort",
];

interface DraftMed {
  name: string;
  type: MedType;
  dosage: string;
  frequency: string;
}

const TOTAL_STEPS = 8;

export default function OnboardingPage() {
  const t = useT();
  const { language, setLanguage } = useLanguage();
  const { status } = useAuth();
  const step = useSessionStore((s) => s.onboardingStep);
  const setStep = useSessionStore((s) => s.setOnboardingStep);
  const router = useRouter();

  const saveProfile = useSaveProfile();
  const upsertSymptomLog = useUpsertSymptomLog();
  const addMedication = useAddMedication();

  const [pcosStatus, setPcosStatus] = useState<PCOSStatus | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [lastPeriodStart, setLastPeriodStart] = useState("");
  const [typicalCycleLengthDays, setTypicalCycleLengthDays] = useState("");
  const [typicalBleedingDays, setTypicalBleedingDays] = useState("");
  const [cycleRegularity, setCycleRegularity] =
    useState<CycleRegularity | null>(null);
  const [symptoms, setSymptoms] = useState<SymptomKey[]>([]);
  const [heightCm, setHeightCm] = useState("");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | null>(
    null
  );
  const [trackWeight, setTrackWeight] = useState(false);
  const [meds, setMeds] = useState<DraftMed[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === "signed_out") router.replace("/login");
  }, [status, router]);

  const next = () => setStep(Math.min(step + 1, TOTAL_STEPS - 1));
  const back = () => setStep(Math.max(step - 1, 0));
  const toggleGoal = (g: Goal) =>
    setGoals((gs) => (gs.includes(g) ? gs.filter((x) => x !== g) : [...gs, g]));
  const toggleSymptom = (s: SymptomKey) =>
    setSymptoms((ss) =>
      ss.includes(s) ? ss.filter((x) => x !== s) : [...ss, s]
    );

  async function finish() {
    setSaving(true);
    try {
      await saveProfile.mutateAsync({
        language,
        pcosStatus,
        goals,
        lastPeriodStart: lastPeriodStart || null,
        typicalCycleLengthDays: typicalCycleLengthDays
          ? Number(typicalCycleLengthDays)
          : null,
        typicalBleedingDays: typicalBleedingDays
          ? Number(typicalBleedingDays)
          : null,
        cycleRegularity,
        heightCm: heightCm ? Number(heightCm) : null,
        activityLevel,
        trackWeight,
        onboardingCompletedAt: new Date().toISOString(),
      });

      if (symptoms.length > 0) {
        await upsertSymptomLog.mutateAsync({
          date: todayISO(),
          symptoms: symptoms.map((key) => ({ key, severity: 2 as const })),
          mood: null,
          sleepHours: null,
        });
      }

      for (const med of meds) {
        if (!med.name.trim()) continue;
        await addMedication.mutateAsync({
          name: med.name.trim(),
          type: med.type,
          dosage: med.dosage.trim() || undefined,
          frequency: med.frequency.trim() || undefined,
          active: true,
        });
      }

      setStep(0);
      router.replace("/home");
    } finally {
      setSaving(false);
    }
  }

  // ---- Step 0: Welcome + language ----------------------------------------
  if (step === 0) {
    return (
      <div className="flex min-h-dvh flex-col justify-between bg-cream-50 px-6 py-10">
        <div className="mt-10">
          <p className="text-sm font-medium uppercase tracking-wide text-teal-600">
            {t("app.name")}
          </p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight text-ink-900">
            {t("onboarding.welcome.title")}
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-600">
            {t("onboarding.welcome.subtitle")}
          </p>

          <div className="mt-10">
            <p className="mb-3 text-sm font-medium text-ink-700">
              {t("onboarding.welcome.languagePrompt")}
            </p>
            <div className="flex gap-2">
              <Chip
                selected={language === "en"}
                onClick={() => setLanguage("en")}
              >
                {t("onboarding.welcome.languageEn")}
              </Chip>
              <Chip
                selected={language === "tl-en"}
                onClick={() => setLanguage("tl-en")}
              >
                {t("onboarding.welcome.languageTaglish")}
              </Chip>
            </div>
          </div>
        </div>
        <Button onClick={next} fullWidth>
          {t("onboarding.welcome.getStarted")}
        </Button>
      </div>
    );
  }

  // ---- Step 1: PCOS status ------------------------------------------------
  if (step === 1) {
    return (
      <OnboardingShell
        step={1}
        totalSteps={TOTAL_STEPS}
        title={t("onboarding.status.title")}
        subtitle={t("onboarding.status.subtitle")}
        onBack={back}
        onNext={next}
        nextDisabled={!pcosStatus}
      >
        <div className="flex flex-col gap-2.5">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setPcosStatus(s)}
              className={`rounded-xl2 border px-4 py-3.5 text-left text-[15px] font-medium transition-colors ${
                pcosStatus === s
                  ? "border-teal-600 bg-teal-50 text-teal-800"
                  : "border-ink-100 bg-white text-ink-800"
              }`}
            >
              {t(`onboarding.status.${s}`)}
            </button>
          ))}
        </div>
      </OnboardingShell>
    );
  }

  // ---- Step 2: Goals -------------------------------------------------------
  if (step === 2) {
    return (
      <OnboardingShell
        step={2}
        totalSteps={TOTAL_STEPS}
        title={t("onboarding.goals.title")}
        subtitle={t("onboarding.goals.subtitle")}
        onBack={back}
        onNext={next}
        nextDisabled={goals.length === 0}
      >
        <div className="flex flex-wrap gap-2">
          {GOAL_OPTIONS.map((g) => (
            <Chip key={g} selected={goals.includes(g)} onClick={() => toggleGoal(g)}>
              {t(`onboarding.goals.${g}`)}
            </Chip>
          ))}
        </div>
      </OnboardingShell>
    );
  }

  // ---- Step 3: Cycle baseline ----------------------------------------------
  if (step === 3) {
    return (
      <OnboardingShell
        step={3}
        totalSteps={TOTAL_STEPS}
        title={t("onboarding.cycle.title")}
        subtitle={t("onboarding.cycle.subtitle")}
        onBack={back}
        onNext={next}
        onSkip={next}
      >
        <div className="flex flex-col gap-5">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-700">
              {t("onboarding.cycle.lastPeriod")}
            </span>
            <input
              type="date"
              value={lastPeriodStart}
              onChange={(e) => setLastPeriodStart(e.target.value)}
              max={todayISO()}
              className="w-full rounded-xl2 border border-ink-100 bg-white px-4 py-3 text-[15px]"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-700">
              {t("onboarding.cycle.typicalLength")}
            </span>
            <input
              type="number"
              inputMode="numeric"
              min={10}
              max={120}
              placeholder="e.g. 45"
              value={typicalCycleLengthDays}
              onChange={(e) => setTypicalCycleLengthDays(e.target.value)}
              className="w-full rounded-xl2 border border-ink-100 bg-white px-4 py-3 text-[15px]"
            />
            <span className="mt-1 block text-xs text-ink-400">
              {t("onboarding.cycle.typicalLengthHint")}
            </span>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-700">
              {t("onboarding.cycle.bleedingDays")}
            </span>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={20}
              value={typicalBleedingDays}
              onChange={(e) => setTypicalBleedingDays(e.target.value)}
              className="w-full rounded-xl2 border border-ink-100 bg-white px-4 py-3 text-[15px]"
            />
          </label>

          <div>
            <span className="mb-1.5 block text-sm font-medium text-ink-700">
              {t("onboarding.cycle.regularity")}
            </span>
            <div className="flex flex-wrap gap-2">
              {(["regular", "irregular", "unknown"] as CycleRegularity[]).map(
                (r) => (
                  <Chip
                    key={r}
                    selected={cycleRegularity === r}
                    onClick={() => setCycleRegularity(r)}
                  >
                    {t(`onboarding.cycle.${r}`)}
                  </Chip>
                )
              )}
            </div>
          </div>
        </div>
      </OnboardingShell>
    );
  }

  // ---- Step 4: Symptoms -----------------------------------------------------
  if (step === 4) {
    return (
      <OnboardingShell
        step={4}
        totalSteps={TOTAL_STEPS}
        title={t("onboarding.symptoms.title")}
        subtitle={t("onboarding.symptoms.subtitle")}
        onBack={back}
        onNext={next}
        onSkip={next}
      >
        <div className="flex flex-wrap gap-2">
          {SYMPTOM_OPTIONS.map((s) => (
            <Chip key={s} selected={symptoms.includes(s)} onClick={() => toggleSymptom(s)}>
              {t(`symptom.${s}`)}
            </Chip>
          ))}
        </div>
      </OnboardingShell>
    );
  }

  // ---- Step 5: Lifestyle -----------------------------------------------------
  if (step === 5) {
    return (
      <OnboardingShell
        step={5}
        totalSteps={TOTAL_STEPS}
        title={t("onboarding.lifestyle.title")}
        subtitle={t("onboarding.lifestyle.subtitle")}
        onBack={back}
        onNext={next}
        onSkip={next}
      >
        <div className="flex flex-col gap-5">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-700">
              {t("onboarding.lifestyle.height")}
            </span>
            <input
              type="number"
              inputMode="numeric"
              min={100}
              max={220}
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              className="w-full rounded-xl2 border border-ink-100 bg-white px-4 py-3 text-[15px]"
            />
          </label>

          <div>
            <span className="mb-1.5 block text-sm font-medium text-ink-700">
              {t("onboarding.lifestyle.activity")}
            </span>
            <div className="flex flex-wrap gap-2">
              {(
                ["sedentary", "light", "moderate", "active"] as const
              ).map((a) => (
                <Chip
                  key={a}
                  selected={activityLevel === a}
                  onClick={() => setActivityLevel(a)}
                >
                  {t(`onboarding.lifestyle.activity.${a}`)}
                </Chip>
              ))}
            </div>
          </div>

          <div className="rounded-xl2 border border-ink-100 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-ink-700">
                {t("onboarding.lifestyle.trackWeight")}
              </span>
              <button
                role="switch"
                aria-checked={trackWeight}
                onClick={() => setTrackWeight((v) => !v)}
                className={`h-7 w-12 shrink-0 rounded-full transition-colors ${
                  trackWeight ? "bg-teal-600" : "bg-ink-100"
                }`}
              >
                <span
                  className={`block h-6 w-6 rounded-full bg-white shadow transition-transform ${
                    trackWeight ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-ink-400">
              {t("onboarding.lifestyle.trackWeightHint")}
            </p>
          </div>
        </div>
      </OnboardingShell>
    );
  }

  // ---- Step 6: Medications / supplements -------------------------------------
  if (step === 6) {
    const updateMed = (i: number, patch: Partial<DraftMed>) =>
      setMeds((ms) => ms.map((m, idx) => (idx === i ? { ...m, ...patch } : m)));
    const removeMed = (i: number) =>
      setMeds((ms) => ms.filter((_, idx) => idx !== i));

    return (
      <OnboardingShell
        step={6}
        totalSteps={TOTAL_STEPS}
        title={t("onboarding.meds.title")}
        subtitle={t("onboarding.meds.subtitle")}
        onBack={back}
        onNext={next}
        onSkip={next}
      >
        <div className="flex flex-col gap-4">
          {meds.map((med, i) => (
            <div key={i} className="rounded-xl2 border border-ink-100 bg-white p-3.5">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex gap-1.5">
                  <Chip
                    selected={med.type === "medication"}
                    onClick={() => updateMed(i, { type: "medication" })}
                    className="!min-h-[36px] !px-3 !py-1.5 !text-xs"
                  >
                    Medication
                  </Chip>
                  <Chip
                    selected={med.type === "supplement"}
                    onClick={() => updateMed(i, { type: "supplement" })}
                    className="!min-h-[36px] !px-3 !py-1.5 !text-xs"
                  >
                    Supplement
                  </Chip>
                </div>
                <button
                  onClick={() => removeMed(i)}
                  aria-label={t("common.delete")}
                  className="text-ink-400 hover:text-blush-600"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
              <input
                placeholder={t("onboarding.meds.name")}
                value={med.name}
                onChange={(e) => updateMed(i, { name: e.target.value })}
                className="mb-2 w-full rounded-lg border border-ink-100 px-3 py-2 text-sm"
              />
              <div className="flex gap-2">
                <input
                  placeholder={t("onboarding.meds.dosage")}
                  value={med.dosage}
                  onChange={(e) => updateMed(i, { dosage: e.target.value })}
                  className="w-1/2 rounded-lg border border-ink-100 px-3 py-2 text-sm"
                />
                <input
                  placeholder={t("onboarding.meds.frequency")}
                  value={med.frequency}
                  onChange={(e) => updateMed(i, { frequency: e.target.value })}
                  className="w-1/2 rounded-lg border border-ink-100 px-3 py-2 text-sm"
                />
              </div>
            </div>
          ))}

          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() =>
                setMeds((ms) => [
                  ...ms,
                  { name: "", type: "medication", dosage: "", frequency: "" },
                ])
              }
              className="flex-1"
            >
              <PlusIcon className="h-4 w-4" />
              {t("onboarding.meds.addMedication")}
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                setMeds((ms) => [
                  ...ms,
                  { name: "", type: "supplement", dosage: "", frequency: "" },
                ])
              }
              className="flex-1"
            >
              <PlusIcon className="h-4 w-4" />
              {t("onboarding.meds.addSupplement")}
            </Button>
          </div>
        </div>
      </OnboardingShell>
    );
  }

  // ---- Step 7: Finish --------------------------------------------------------
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-cream-50 px-6 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 text-3xl">
        🌿
      </div>
      <h1 className="text-2xl font-semibold text-ink-900">
        {t("onboarding.finish.title")}
      </h1>
      <p className="mt-2 max-w-xs text-[15px] leading-relaxed text-ink-600">
        {t("onboarding.finish.subtitle")}
      </p>
      <Button onClick={finish} disabled={saving} className="mt-10 w-full max-w-xs">
        {saving ? t("common.loading") : t("onboarding.finish.cta")}
      </Button>
    </div>
  );
}
