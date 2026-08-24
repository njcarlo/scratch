"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { DisclaimerBanner } from "@/components/ui/DisclaimerBanner";
import { PlusIcon, TrashIcon, XIcon } from "@/components/icons";
import { useT } from "@/lib/i18n";
import { useAddFoodLog, useFoodLogs, useRemoveFoodLog } from "@/lib/queries/food";
import { searchFoods, getFoodById } from "@/lib/data/food-service";
import { reflectOnMeal } from "@/lib/data/meal-guidance";
import { nowHHmm, todayISO } from "@/lib/dates";
import type { FoodLogItem, MealType } from "@/lib/types";

const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

export default function FoodPage() {
  const t = useT();
  const { data: foodLogs = [] } = useFoodLogs();
  const addLog = useAddFoodLog();
  const removeLog = useRemoveFoodLog();

  const [query, setQuery] = useState("");
  const [mealType, setMealType] = useState<MealType>("lunch");
  const [selected, setSelected] = useState<FoodLogItem[]>([]);
  const [customName, setCustomName] = useState("");
  const [reflection, setReflection] = useState<string | null>(null);

  const results = useMemo(() => (query ? searchFoods(query).slice(0, 12) : []), [query]);
  const today = todayISO();
  const todayLogs = foodLogs.filter((l) => l.date === today);

  function addItem(foodId: string) {
    setSelected((s) => [...s, { foodId }]);
    setQuery("");
  }
  function addCustom() {
    if (!customName.trim()) return;
    setSelected((s) => [...s, { customName: customName.trim() }]);
    setCustomName("");
  }
  function removeItem(i: number) {
    setSelected((s) => s.filter((_, idx) => idx !== i));
  }

  async function submit() {
    if (selected.length === 0) return;
    await addLog.mutateAsync({
      date: today,
      time: nowHHmm(),
      mealType,
      items: selected,
    });
    const foods = selected
      .map((i) => (i.foodId ? getFoodById(i.foodId) : undefined))
      .filter(Boolean) as NonNullable<ReturnType<typeof getFoodById>>[];
    setReflection(reflectOnMeal(foods));
    setSelected([]);
  }

  return (
    <div className="flex flex-col gap-4">
      <DisclaimerBanner stringKey="safety.food" />

      <Card>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("food.searchPlaceholder")}
          className="w-full rounded-xl2 border border-ink-100 bg-white px-4 py-3 text-[15px]"
        />
        {results.length > 0 && (
          <ul className="mt-2 flex flex-col gap-1">
            {results.map((food) => (
              <li key={food.id}>
                <button
                  onClick={() => addItem(food.id)}
                  className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left hover:bg-cream-100"
                >
                  <span>
                    <span className="block text-sm font-medium text-ink-800">
                      {food.name}
                    </span>
                    <span className="block text-xs text-ink-400">
                      {food.brand ?? food.source ?? t(`food.confidence.${food.dataConfidence}`)}
                    </span>
                  </span>
                  <PlusIcon className="h-4 w-4 text-teal-600" />
                </button>
              </li>
            ))}
          </ul>
        )}
        {query && results.length === 0 && (
          <div className="mt-2 flex items-center gap-2">
            <input
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder={t("food.customPlaceholder")}
              className="flex-1 rounded-lg border border-ink-100 px-3 py-2 text-sm"
            />
            <Button variant="secondary" onClick={addCustom}>
              {t("common.add")}
            </Button>
          </div>
        )}
      </Card>

      {selected.length > 0 && (
        <Card>
          <div className="mb-3 flex flex-wrap gap-2">
            {MEAL_TYPES.map((mt) => (
              <Chip key={mt} selected={mealType === mt} onClick={() => setMealType(mt)}>
                {t(`food.mealType.${mt}`)}
              </Chip>
            ))}
          </div>
          <ul className="flex flex-col gap-1.5">
            {selected.map((item, i) => {
              const food = item.foodId ? getFoodById(item.foodId) : undefined;
              return (
                <li
                  key={i}
                  className="flex items-center justify-between rounded-lg bg-cream-100 px-3 py-2"
                >
                  <span className="text-sm text-ink-800">
                    {food?.name ?? item.customName}
                  </span>
                  <button onClick={() => removeItem(i)} aria-label={t("common.delete")}>
                    <XIcon className="h-4 w-4 text-ink-400" />
                  </button>
                </li>
              );
            })}
          </ul>
          <Button onClick={submit} disabled={addLog.isPending} fullWidth className="mt-3">
            {t("food.logMeal")}
          </Button>
        </Card>
      )}

      {reflection && (
        <Card className="border-teal-200 bg-teal-50">
          <p className="text-sm leading-relaxed text-teal-800">{reflection}</p>
        </Card>
      )}

      <div>
        <h2 className="mb-2 text-sm font-semibold text-ink-800">{t("food.today")}</h2>
        {todayLogs.length === 0 ? (
          <p className="text-sm text-ink-500">{t("food.empty")}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {todayLogs.map((log) => (
              <li key={log.id}>
                <Card className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-teal-600">
                      {t(`food.mealType.${log.mealType}`)} · {log.time}
                    </p>
                    <p className="text-sm text-ink-800">
                      {log.items
                        .map((i) => i.customName ?? getFoodById(i.foodId ?? "")?.name)
                        .filter(Boolean)
                        .join(", ")}
                    </p>
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
