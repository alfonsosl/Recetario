import { useCallback, useMemo } from 'react';
import { getDefaultRecipe, getRecipeById } from '../data';
import type { DayKey, MealType, Recipe, WeekNumber } from '../types';
import { DAYS, MEALS } from '../utils/days';
import { getISOWeek, getRotationWeek } from '../utils/isoWeek';
import { useLocalStorage } from './useLocalStorage';

type Overrides = Record<string, string>; // "w1-lunes-comida" -> id de receta

const slotKey = (week: WeekNumber, day: DayKey, meal: MealType) => `w${week}-${day}-${meal}`;

export function usePlanner() {
  const isoWeek = getISOWeek();
  const autoWeek = getRotationWeek();
  // null = seguir la rotación automática
  const [manualWeek, setManualWeek] = useLocalStorage<WeekNumber | null>('med5:plan:week', null);
  const [overrides, setOverrides] = useLocalStorage<Overrides>('med5:plan:overrides', {});

  const activeWeek: WeekNumber = manualWeek ?? autoWeek;

  const getRecipe = useCallback(
    (week: WeekNumber, day: DayKey, meal: MealType): Recipe => {
      const overrideId = overrides[slotKey(week, day, meal)];
      return (overrideId && getRecipeById(overrideId)) || getDefaultRecipe(week, day, meal);
    },
    [overrides],
  );

  const isSwapped = useCallback(
    (week: WeekNumber, day: DayKey, meal: MealType) => Boolean(overrides[slotKey(week, day, meal)]),
    [overrides],
  );

  const swap = useCallback(
    (week: WeekNumber, day: DayKey, meal: MealType, recipeId: string) =>
      setOverrides((o) => {
        const key = slotKey(week, day, meal);
        const next = { ...o };
        if (recipeId === key) delete next[key]; // volver a la receta original
        else next[key] = recipeId;
        return next;
      }),
    [setOverrides],
  );

  const resetSlot = useCallback(
    (week: WeekNumber, day: DayKey, meal: MealType) =>
      setOverrides((o) => {
        const next = { ...o };
        delete next[slotKey(week, day, meal)];
        return next;
      }),
    [setOverrides],
  );

  const resetWeek = useCallback(
    (week: WeekNumber) =>
      setOverrides((o) => Object.fromEntries(Object.entries(o).filter(([k]) => !k.startsWith(`w${week}-`)))),
    [setOverrides],
  );

  const weekRecipes = useCallback(
    (week: WeekNumber): Recipe[] => DAYS.flatMap((d) => MEALS.map((m) => getRecipe(week, d.key, m.key))),
    [getRecipe],
  );

  const swappedCount = useMemo(
    () => Object.keys(overrides).filter((k) => k.startsWith(`w${activeWeek}-`)).length,
    [overrides, activeWeek],
  );

  return {
    isoWeek,
    autoWeek,
    activeWeek,
    isManual: manualWeek !== null,
    setWeek: (w: WeekNumber) => setManualWeek(w === autoWeek ? null : w),
    followAuto: () => setManualWeek(null),
    getRecipe,
    isSwapped,
    swap,
    resetSlot,
    resetWeek,
    weekRecipes,
    swappedCount,
  };
}

export type Planner = ReturnType<typeof usePlanner>;
