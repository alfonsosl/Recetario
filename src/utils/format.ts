import type { Ingredient, Unit } from '../types';

const nf = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 2 });

const FRACTIONS: Record<string, string> = { '0.25': '¼', '0.5': '½', '0.75': '¾' };

function num(n: number): string {
  const whole = Math.floor(n);
  const frac = Math.round((n - whole) * 100) / 100;
  const symbol = FRACTIONS[String(frac)];
  if (symbol) return whole > 0 ? `${whole}${symbol}` : symbol;
  return nf.format(n);
}

const PLURALS: Record<string, [string, string]> = {
  diente: ['diente', 'dientes'],
  hoja: ['hoja', 'hojas'],
  cdta: ['cdta', 'cdtas'],
  manojo: ['manojo', 'manojo'],
  cabeza: ['cabeza', 'cabezas'],
};

export function formatQuantity(quantity: number | null, unit: Unit | 'cabeza'): string {
  if (unit === 'al_gusto' || quantity === null) return 'al gusto';
  if (unit === 'g' && quantity >= 1000) return `${nf.format(quantity / 1000)} kg`;
  if (unit === 'ml' && quantity >= 1000) return `${nf.format(quantity / 1000)} l`;
  if (unit === 'g' || unit === 'ml') return `${nf.format(quantity)} ${unit}`;
  if (unit === 'ud') return num(quantity);
  const p = PLURALS[unit];
  return p ? `${num(quantity)} ${quantity > 1 ? p[1] : p[0]}` : `${num(quantity)} ${unit}`;
}

export const formatIngredient = (i: Ingredient) => formatQuantity(i.quantity, i.unit);

/** "lentejas pardinas" → "Lentejas pardinas" */
export const capitalize = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
