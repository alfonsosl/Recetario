import type { NutritionGroup, Recipe } from '../types';

/**
 * Evaluación del equilibrio de una semana (14 comidas/cenas).
 *
 * Criterios del propio recetario (recetario.json → meta.criterios_plan):
 *   "Objetivo semanal aprox.: 2-3 legumbres, 3-4 pescado, 3-5 carne, 2-3 huevo como plato principal."
 * Criterios generales añadidos por la app (orientativos, no son una pauta médica):
 *   - verdura u hortaliza en la mayoría de comidas y cenas (≥ 9 de 14);
 *   - fritos con moderación (≤ 3 platos fritos por semana).
 * Puntuación: cada criterio vale 1 si se cumple, 0,5 si se desvía en 1 y 0 si se desvía más.
 */

export type CriterionStatus = 'ok' | 'cerca' | 'fuera';

export interface Criterion {
  key: NutritionGroup | 'verdura' | 'fritos';
  label: string;
  value: number;
  min: number;
  max: number;
  /** Texto del objetivo, p. ej. "2-3". */
  target: string;
  status: CriterionStatus;
  advice: string | null;
  source: 'recetario' | 'general';
}

export interface Evaluation {
  score: number;
  level: 'Muy equilibrada' | 'Bastante equilibrada' | 'Mejorable';
  criteria: Criterion[];
}

const GROUP_TARGETS: Record<NutritionGroup, { min: number; max: number; label: string }> = {
  legumbre: { min: 2, max: 3, label: 'Legumbre' },
  pescado: { min: 3, max: 4, label: 'Pescado' },
  carne: { min: 3, max: 5, label: 'Carne' },
  huevo: { min: 2, max: 3, label: 'Huevo' },
};

/** Ingredientes de sofrito o aderezo que no cuentan como ración de verdura. */
const AROMATICS = new Set(['ajo', 'cebolla', 'perejil fresco', 'hierbabuena', 'limón', 'patata']);

/** ¿El plato aporta una ración apreciable de verdura? (estimación por ingredientes) */
export function hasVegetables(r: Recipe): boolean {
  if (r.category === 'verdura' || r.category === 'ensalada') return true;
  return r.ingredients.some(
    (i) =>
      i.section === 'verdura_fruta' &&
      !i.optional &&
      !AROMATICS.has(i.name.toLowerCase()) &&
      i.quantity !== null &&
      ((i.unit === 'g' && i.quantity >= 200) || (i.unit === 'ud' && i.quantity >= 2)),
  );
}

export const isFried = (r: Recipe) => r.tags.some((t) => t.toLowerCase().startsWith('frito'));

function status(value: number, min: number, max: number): CriterionStatus {
  if (value >= min && value <= max) return 'ok';
  const off = value < min ? min - value : value - max;
  return off <= 1 ? 'cerca' : 'fuera';
}

const plural = (n: number, s: string, p: string) => `${n} ${n === 1 ? s : p}`;

/** `meals`: las 14 comidas/cenas de la semana, cada una con sus 1-2 platos. */
export function evaluateWeek(meals: Recipe[][]): Evaluation {
  const dishes = meals.flat();
  const criteria: Criterion[] = [];

  for (const g of Object.keys(GROUP_TARGETS) as NutritionGroup[]) {
    const t = GROUP_TARGETS[g];
    const value = dishes.filter((d) => d.group === g).length;
    const st = status(value, t.min, t.max);
    criteria.push({
      key: g,
      label: t.label,
      value,
      min: t.min,
      max: t.max,
      target: `${t.min}-${t.max}`,
      status: st,
      advice:
        value < t.min
          ? `Añade ${plural(t.min - value, 'plato', 'platos')} de ${t.label.toLowerCase()}`
          : value > t.max
            ? `Sustituye ${plural(value - t.max, 'plato', 'platos')} de ${t.label.toLowerCase()}`
            : null,
      source: 'recetario',
    });
  }

  const veg = meals.filter((m) => m.some(hasVegetables)).length;
  const vegSt = status(veg, 9, meals.length);
  criteria.push({
    key: 'verdura',
    label: 'Comidas con verdura',
    value: veg,
    min: 9,
    max: meals.length,
    target: `≥ 9 de ${meals.length}`,
    status: vegSt,
    advice: veg < 9 ? `Añade verdura o ensalada como acompañamiento en ${plural(9 - veg, 'comida', 'comidas')} más` : null,
    source: 'general',
  });

  const fried = dishes.filter(isFried).length;
  const friedSt = status(fried, 0, 3);
  criteria.push({
    key: 'fritos',
    label: 'Platos fritos',
    value: fried,
    min: 0,
    max: 3,
    target: '≤ 3',
    status: friedSt,
    advice: fried > 3 ? `Cambia ${plural(fried - 3, 'frito', 'fritos')} por plancha, horno o guiso` : null,
    source: 'general',
  });

  const points = criteria.reduce((s, c) => s + (c.status === 'ok' ? 1 : c.status === 'cerca' ? 0.5 : 0), 0);
  const score = Math.round((points / criteria.length) * 100);
  return {
    score,
    level: score >= 85 ? 'Muy equilibrada' : score >= 65 ? 'Bastante equilibrada' : 'Mejorable',
    criteria,
  };
}
