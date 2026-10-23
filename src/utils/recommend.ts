import type { MealType, NutritionGroup, Recipe } from '../types';
import { hasVegetables, isFried, type Evaluation } from './balance';

/** Platos que funcionan como acompañamiento (primero, guarnición, verdura o ensalada). */
export const isSide = (r: Recipe) => r.dishType !== 'principal' || r.category === 'verdura' || r.category === 'ensalada';

/**
 * Acompañamientos recomendados para una comida/cena: si el plato principal ya es contundente
 * (legumbre, arroz, pasta, guiso) se proponen verduras y ensaladas ligeras; si no lleva verdura, se priorizan.
 */
export function recommendSides(current: Recipe[], all: Recipe[], meal: MealType): Recipe[] {
  const ids = new Set(current.map((r) => r.id));
  const needsVeg = !current.some(hasVegetables);
  return all
    .filter((r) => !ids.has(r.id) && isSide(r) && r.moments.includes(meal))
    .sort((a, b) => Number(hasVegetables(b) && needsVeg) - Number(hasVegetables(a) && needsVeg) || Number(isFried(a)) - Number(isFried(b)) || a.title.localeCompare(b.title, 'es'));
}

export interface Recommendation {
  reason: string;
  recipes: Recipe[];
}

/**
 * Propuestas para corregir los criterios que no se cumplen en la semana.
 * Prioriza sugerencias nuevas y después recetas del recetario que no estén ya en esa semana.
 */
export function recommendForBalance(evaluation: Evaluation, weekIds: Set<string>, pending: Recipe[], all: Recipe[]): Recommendation[] {
  const pool = [...pending, ...all.filter((r) => !weekIds.has(r.id) && !pending.some((p) => p.id === r.id))];
  const out: Recommendation[] = [];
  for (const c of evaluation.criteria) {
    if (c.status === 'ok') continue;
    if (c.key === 'verdura' && c.value < c.min) {
      out.push({ reason: 'Más verdura como acompañamiento', recipes: pool.filter((r) => isSide(r) && hasVegetables(r) && !isFried(r)).slice(0, 4) });
    } else if (c.key === 'fritos' && c.value > c.max) {
      out.push({ reason: 'Alternativas sin fritura', recipes: pool.filter((r) => r.dishType === 'principal' && !isFried(r) && r.tags.some((t) => /plancha|horno|ligero|cuchara/i.test(t))).slice(0, 4) });
    } else if (c.key !== 'verdura' && c.key !== 'fritos' && c.value < c.min) {
      const g = c.key as NutritionGroup;
      out.push({ reason: `Para sumar ${c.label.toLowerCase()}`, recipes: pool.filter((r) => r.group === g && r.dishType === 'principal').slice(0, 4) });
    }
  }
  return out.filter((r) => r.recipes.length > 0);
}
