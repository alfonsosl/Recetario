import type { WeekNumber } from '../types';

/** Número de semana ISO-8601 (las semanas empiezan en lunes; la semana 1 contiene el primer jueves del año). */
export function getISOWeek(date = new Date()): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7; // domingo = 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum); // jueves de la misma semana
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
}

/** Rotación perpetua de 4 semanas: ((semanaISO - 1) % 4) + 1. */
export function getRotationWeek(date = new Date()): WeekNumber {
  return (((getISOWeek(date) - 1) % 4) + 1) as WeekNumber;
}
