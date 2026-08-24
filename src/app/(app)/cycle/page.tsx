"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { DisclaimerBanner } from "@/components/ui/DisclaimerBanner";
import { TrashIcon } from "@/components/icons";
import { useT } from "@/lib/i18n";
import { useAddCycleLog, useCycleLogs, useRemoveCycleLog } from "@/lib/queries/cycle";
import { cycleLengths, cycleStats } from "@/lib/insights";
import { formatFriendlyDate, todayISO } from "@/lib/dates";
import type { CycleEventType, FlowLevel } from "@/lib/types";

const EVENT_TYPES: CycleEventType[] = ["period_start", "period_end", "spotting"];
const FLOW_LEVELS: FlowLevel[] = ["light", "medium", "heavy"];

export default function CyclePage() {
  const t = useT();
  const { data: cycleLogs = [] } = useCycleLogs();
  const addLog = useAddCycleLog();
  const removeLog = useRemoveCycleLog();

  const [adding, setAdding] = useState(false);
  const [date, setDate] = useState(todayISO());
  const [type, setType] = useState<CycleEventType>("period_start");
  const [flow, setFlow] = useState<FlowLevel | null>(null);

  const stats = cycleStats(cycleLengths(cycleLogs));
  const sorted = [...cycleLogs].sort((a, b) => b.date.localeCompare(a.date));

  async function submit() {
    await addLog.mutateAsync({
      date,
      type,
      flow: type === "period_start" ? flow ?? undefined : undefined,
    });
    setAdding(false);
    setFlow(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <DisclaimerBanner stringKey="safety.general" />

      <Card>
        <h2 className="text-sm font-semibold text-ink-800">
          {t("cycle.stats.average")}
        </h2>
        {stats ? (
          <div className="mt-2 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-xl font-semibold text-ink-900">
                {stats.average}
              </p>
              <p className="text-xs text-ink-400">{t("cycle.stats.average")}</p>
            </div>
            <div>
              <p className="text-xl font-semibold text-ink-900">
                {stats.shortest}
              </p>
              <p className="text-xs text-ink-400">{t("cycle.stats.shortest")}</p>
            </div>
            <div>
              <p className="text-xl font-semibold text-ink-900">
                {stats.longest}
              </p>
              <p className="text-xs text-ink-400">{t("cycle.stats.longest")}</p>
            </div>
          </div>
        ) : (
          <p className="mt-1 text-sm text-ink-500">{t("cycle.stats.notEnough")}</p>
        )}
        <p className="mt-3 text-xs leading-relaxed text-ink-400">
          {t("cycle.regularityNote")}
        </p>
      </Card>

      {!adding ? (
        <Button onClick={() => setAdding(true)} fullWidth>
          {t("cycle.logPeriod")}
        </Button>
      ) : (
        <Card>
          <div className="flex flex-col gap-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink-700">
                {t("common.date")}
              </span>
              <input
                type="date"
                value={date}
                max={todayISO()}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl2 border border-ink-100 bg-white px-4 py-3 text-[15px]"
              />
            </label>

            <div className="flex flex-wrap gap-2">
              {EVENT_TYPES.map((et) => (
                <Chip key={et} selected={type === et} onClick={() => setType(et)}>
                  {t(`cycle.${et === "period_start" ? "periodStart" : et === "period_end" ? "periodEnd" : "spotting"}`)}
                </Chip>
              ))}
            </div>

            {type === "period_start" && (
              <div>
                <span className="mb-1.5 block text-sm font-medium text-ink-700">
                  {t("cycle.flow")}
                </span>
                <div className="flex gap-2">
                  {FLOW_LEVELS.map((f) => (
                    <Chip key={f} selected={flow === f} onClick={() => setFlow(f)}>
                      {t(`cycle.flow.${f}`)}
                    </Chip>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setAdding(false)} className="flex-1">
                {t("common.cancel")}
              </Button>
              <Button onClick={submit} disabled={addLog.isPending} className="flex-1">
                {t("common.save")}
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div>
        <h2 className="mb-2 text-sm font-semibold text-ink-800">
          {t("cycle.history")}
        </h2>
        {sorted.length === 0 ? (
          <p className="text-sm text-ink-500">{t("cycle.empty")}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {sorted.map((log) => (
              <li key={log.id}>
                <Card className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-ink-800">
                      {formatFriendlyDate(log.date)} —{" "}
                      {t(
                        `cycle.${
                          log.type === "period_start"
                            ? "periodStart"
                            : log.type === "period_end"
                            ? "periodEnd"
                            : "spotting"
                        }`
                      )}
                    </p>
                    {log.flow && (
                      <p className="text-xs text-ink-400">
                        {t(`cycle.flow.${log.flow}`)}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => removeLog.mutate(log.id)}
                    aria-label={t("common.delete")}
                    className="p-2 text-ink-400 hover:text-blush-600"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
