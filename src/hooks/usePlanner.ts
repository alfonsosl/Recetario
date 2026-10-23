import { useCallback, useMemo } from 'react';
import { BASE_RECIPES, getDefaultSlot } from '../data';
import { useRecipes } from '../store/recipeStore';
import type { DayKey, MealType, Recipe, WeekNumber } from '../types';
import { evaluateWeek } from '../utils/balance';
import { DAYS, MEALS } from '../utils/days';
import { getISOWeek, getRotationWeek } from '../utils/isoWeek';
import { useLocalStorage } from './useLocalStorage';

/** "w1-lunes-comida" → ids de los platos de esa comida (cuando el usuario la ha cambiado). */
type Overrides = Record<string, string[]>;

const slotKey = (week: WeekNumber, day: DayKey, meal: MealType) => `w${week}-${day}-${meal}`;
const BASE_BY_ID = new Map(BASE_RECIPES.map((r) => [r.id, r]));

export const MAX_DISHES = 3;

export function usePlanner() {
  const { byId } = useRecipes();
  const isoWeek = getISOWeek();
  const autoWeek = getRotationWeek();
  // null = seguir la rotación automática
  const [manualWeek, setManualWeek] = useLocalStorage<WeekNumber | null>('med5:plan:week', null);
  const [overrides, setOverrides] = useLocalStorage<Overrides>('med5:plan:overrides:v2', {});

  const activeWeek: WeekNumber = manualWeek ?? autoWeek;

  const getSlotIds = useCallback(
    (week: WeekNumber, day: DayKey, meal: MealType): string[] => {
      const o = overrides[slotKey(week, day, meal)];
      // Si alguna receta del cambio se ha eliminado, se vuelve al plan original.
      return Array.isArray(o) && o.length > 0 && o.every((id) => byId.has(id)) ? o : getDefaultSlot(week, day, meal);
    },
    [overrides, byId],
  );

  /** Platos de una comida o cena (normalmente 1-2: primero/acompañamiento + segundo). */
  const getSlot = useCallback(
    (week: WeekNumber, day: DayKey, meal: MealType): Recipe[] => getSlotIds(week, day, meal).map((id) => byId.get(id)!),
    [getSlotIds, byId],
  );

  const isSwapped = useCallback(
    (week: WeekNumber, day: DayKey, meal: MealType) => Boolean(overrides[slotKey(week, day, meal)]),
    [overrides],
  );

  const updateSlot = useCallback(
    (week: WeekNumber, day: DayKey, meal: MealType, fn: (ids: string[]) => string[]) =>
      setOverrides((o) => {
        const key = slotKey(week, day, meal);
        const original = getDefaultSlot(week, day, meal);
        const current = Array.isArray(o[key]) && o[key].length ? o[key] : original;
        const next = fn([...current]).slice(0, MAX_DISHES);
        const copy = { ...o };
        if (next.length === 0) return o;
        if (next.length === original.length && next.every((id, i) => id === original[i])) delete copy[key];
        else copy[key] = next;
        return copy;
      }),
    [setOverrides],
  );

  /** Sustituye el plato en la posición `index`. */
  const swapDish = useCallback(
    (week: WeekNumber, day: DayKey, meal: MealType, index: number, recipeId: string) =>
      updateSlot(week, day, meal, (ids) => {
        ids[index] = recipeId;
        return ids;
      }),
    [updateSlot],
  );

  /** Añade un plato (acompañamiento). Los primeros y guarniciones se colocan delante. */
  const addDish = useCallback(
    (week: WeekNumber, day: DayKey, meal: MealType, recipeId: string, first = false) =>
      updateSlot(week, day, meal, (ids) => (first ? [recipeId, ...ids] : [...ids, recipeId])),
    [updateSlot],
  );

  const removeDish = useCallback(
    (week: WeekNumber, day: DayKey, meal: MealType, index: number) =>
      updateSlot(week, day, meal, (ids) => (ids.length > 1 ? ids.filter((_, i) => i !== index) : ids)),
    [updateSlot],
  );

  const resetWeek = useCallback(
    (week: WeekNumber) =>
      setOverrides((o) => Object.fromEntries(Object.entries(o).filter(([k]) => !k.startsWith(`w${week}-`)))),
    [setOverrides],
  );

  const weekMeals = useCallback(
    (week: WeekNumber): Recipe[][] => DAYS.flatMap((d) => MEALS.map((m) => getSlot(week, d.key, m.key))),
    [getSlot],
  );

  /** Todos los platos de la semana (cada aparición cuenta para la lista de la compra). */
  const weekRecipes = useCallback((week: WeekNumber): Recipe[] => weekMeals(week).flat(), [weekMeals]);

  /** Equilibrio de la semana con tus cambios y con el plan original del recetario. */
  const evaluate = useCallback(
    (week: WeekNumber) => ({
      current: evaluateWeek(weekMeals(week)),
      original: evaluateWeek(
        DAYS.flatMap((d) => MEALS.map((m) => getDefaultSlot(week, d.key, m.key).map((id) => BASE_BY_ID.get(id)!))),
      ),
    }),
    [weekMeals],
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
    addDish,
    removeDish,
    resetWeek,
    weekRecipes,
    weekMeals,
    evaluate,
    usage,
    swappedCount,
  };
}

export type Planner = ReturnType<typeof usePlanner>;
