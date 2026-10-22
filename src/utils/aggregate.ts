import type { Category, Ingredient, NewItemInput, Recipe, Unit } from '../types';
import { formatQuantity } from './format';

interface Bucket {
  name: string;
  unit: Unit;
  quantity: number;
  category: Category;
}

const keyOf = (i: Ingredient) => `${i.name.trim().toLowerCase()}|${i.unit}`;

/**
 * Suma los ingredientes de varias recetas (ya calculadas para 5 personas)
 * agrupando por nombre + unidad. Omite ingredientes de grifo (agua).
 */
export function aggregateIngredients(recipes: Recipe[]): NewItemInput[] {
  const buckets = new Map<string, Bucket>();
  for (const recipe of recipes) {
    for (const ing of recipe.ingredients) {
      if (ing.pantry) continue;
      const k = keyOf(ing);
      const b = buckets.get(k);
      if (b) b.quantity += ing.quantity;
      else buckets.set(k, { name: ing.name, unit: ing.unit, quantity: ing.quantity, category: ing.category });
    }
  }
  // Si un mismo producto aparece con varias unidades, se fusionan en una sola línea legible.
  const byName = new Map<string, Bucket[]>();
  for (const b of buckets.values()) {
    const n = b.name.toLowerCase();
    byName.set(n, [...(byName.get(n) ?? []), b]);
  }
  const items: NewItemInput[] = [];
  for (const group of byName.values()) {
    const quantity = group.map((b) => formatQuantity(b.quantity, b.unit)).join(' + ');
    items.push({ name: group[0].name, quantity, category: group[0].category, source: 'menu' });
  }
  return items.sort((a, b) => a.name.localeCompare(b.name, 'es'));
}
