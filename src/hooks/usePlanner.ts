import { useCallback, useMemo } from 'react';
import { getDefaultSlot, getRecipeById, nutritionGroup } from '../data';
import type { DayKey, MealType, Recipe, WeekNumber } from '../types';
import { DAYS, MEALS } from '../utils/days';
import { getISOWeek, getRotationWeek } from '../utils/isoWeek';
import { useLocalStorage } from './useLocalStorage';

/** "w1-lunes-comida" → ids de los platos de esa comida (cuando el usuario la ha cambiado). */
type Overrides = Record<string, string[]>;

const slotKey = (week: WeekNumber, day: DayKey, meal: MealType) => `w${week}-${day}-${meal}`;

export interface Balance {
  legumbre: number;
  pescado: number;
  carne: number;
  huevo: number;
}

export function usePlanner() {
  const isoWeek = getISOWeek();
  const autoWeek = getRotationWeek();
  // null = seguir la rotación automática
  const [manualWeek, setManualWeek] = useLocalStorage<WeekNumber | null>('med5:plan:week', null);
  const [overrides, setOverrides] = useLocalStorage<Overrides>('med5:plan:overrides:v2', {});

  const activeWeek: WeekNumber = manualWeek ?? autoWeek;

  const getSlotIds = useCallback(
    (week: WeekNumber, day: DayKey, meal: MealType): string[] => {
      const o = overrides[slotKey(week, day, meal)];
      return Array.isArray(o) && o.every((id) => getRecipeById(id)) ? o : getDefaultSlot(week, day, meal);
    },
    [overrides],
  );

  /** Platos de una comida o cena (1 o 2: p. ej. primero + segundo). */
  const getSlot = useCallback(
    (week: WeekNumber, day: DayKey, meal: MealType): Recipe[] => getSlotIds(week, day, meal).map((id) => getRecipeById(id)!),
    [getSlotIds],
  );

  const isSwapped = useCallback(
    (week: WeekNumber, day: DayKey, meal: MealType) => Boolean(overrides[slotKey(week, day, meal)]),
    [overrides],
  );

  /** Sustituye el plato en la posición `index` de esa comida/cena por otra receta. */
  const swapDish = useCallback(
    (week: WeekNumber, day: DayKey, meal: MealType, index: number, recipeId: string) =>
      setOverrides((o) => {
        const key = slotKey(week, day, meal);
        const current = Array.isArray(o[key]) ? [...o[key]] : [...getDefaultSlot(week, day, meal)];
        current[index] = recipeId;
        const next = { ...o };
        const original = getDefaultSlot(week, day, meal);
        if (current.length === original.length && current.every((id, i) => id === original[i])) delete next[key];
        else next[key] = current;
        return next;
      }),
    [setOverrides],
  );

  const resetWeek = useCallback(
    (week: WeekNumber) =>
      setOverrides((o) => Object.fromEntries(Object.entries(o).filter(([k]) => !k.startsWith(`w${week}-`)))),
    [setOverrides],
  );

  /** Todos los platos de la semana (cada aparición cuenta para la lista de la compra). */
  const weekRecipes = useCallback(
    (week: WeekNumber): Recipe[] => DAYS.flatMap((d) => MEALS.flatMap((m) => getSlot(week, d.key, m.key))),
    [getSlot],
  );

  const weekBalance = useCallback(
    (week: WeekNumber): Balance => {
      const b: Balance = { legumbre: 0, pescado: 0, carne: 0, huevo: 0 };
      for (const r of weekRecipes(week)) {
        const g = nutritionGroup(r.id);
        if (g) b[g] += 1;
      }
      return b;
    },
    [weekRecipes],
  );

  /** Dónde aparece cada receta en el plan (semana, día, momento). */
  const usage = useMemo(() => {
    const map = new Map<string, { week: WeekNumber; day: DayKey; meal: MealType }[]>();
    for (const week of [1, 2, 3, 4] as WeekNumber[])
      for (const d of DAYS)
        for (const m of MEALS)
          for (const id of getSlotIds(week, d.key, m.key)) {
            if (!map.has(id)) map.set(id, []);
            map.get(id)!.push({ week, day: d.key, meal: m.key });
          }
    return map;
  }, [getSlotIds]);

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
    getSlot,
    isSwapped,
    swapDish,
    resetWeek,
    weekRecipes,
    weekBalance,
    usage,
    swappedCount,
  };
}

export type Planner = ReturnType<typeof usePlanner>;
