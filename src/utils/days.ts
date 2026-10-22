import type { DayKey, MealType } from '../types';

export const DAYS: { key: DayKey; label: string; short: string }[] = [
  { key: 'lunes', label: 'Lunes', short: 'L' },
  { key: 'martes', label: 'Martes', short: 'M' },
  { key: 'miercoles', label: 'Miércoles', short: 'X' },
  { key: 'jueves', label: 'Jueves', short: 'J' },
  { key: 'viernes', label: 'Viernes', short: 'V' },
  { key: 'sabado', label: 'Sábado', short: 'S' },
  { key: 'domingo', label: 'Domingo', short: 'D' },
];

export const MEALS: { key: MealType; label: string }[] = [
  { key: 'comida', label: 'Comida' },
  { key: 'cena', label: 'Cena' },
];

export const dayLabel = (key: DayKey) => DAYS.find((d) => d.key === key)?.label ?? key;

/** Día de la semana actual (lunes = índice 0). */
export const todayKey = (date = new Date()): DayKey => DAYS[(date.getDay() + 6) % 7].key;
