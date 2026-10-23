import type { Recipe } from '../types';

export const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

/** Búsqueda por título, etiquetas e ingredientes, sin tildes. Todas las palabras deben aparecer. */
export function matchesRecipe(recipe: Recipe, query: string): boolean {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const haystack = normalize([recipe.title, recipe.category, ...recipe.tags, ...recipe.ingredients.map((i) => i.name)].join(' '));
  return words.every((w) => haystack.includes(w));
}
