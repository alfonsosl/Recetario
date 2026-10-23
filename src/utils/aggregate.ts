import type { Category, NewItemInput, Recipe, Unit } from '../types';
import { SECTION_TO_CATEGORY } from './categories';
import { capitalize, formatQuantity } from './format';

/** Orden de pasillos de la lista (igual que datos/build.py), con especias al final. */
const ORDER: Category[] = [
  'Verdura y fruta',
  'Carne',
  'Pescado',
  'Huevos y lácteos',
  'Panadería y refrigerados',
  'Congelados',
  'Despensa',
  'Especias',
];

/** Redondeo de compra: g/ml a múltiplos de 50 hacia arriba; ajo en cabezas (~10 dientes); resto hacia arriba. */
function round(quantity: number, unit: Unit): { quantity: number; unit: Unit | 'cabeza' } {
  if (unit === 'g' || unit === 'ml') return { quantity: Math.ceil(quantity / 50) * 50, unit };
  if (unit === 'diente') return { quantity: Math.ceil(quantity / 10), unit: 'cabeza' };
  return { quantity: Math.ceil(quantity - 1e-9), unit };
}

export interface ShoppingLine extends NewItemInput {
  /** Recetas que usan el producto (para mostrar "para qué es"). */
  recipes: string[];
}

/**
 * Suma los ingredientes de los platos indicados (cada aparición cuenta: si la ensalada mixta
 * sale 2 veces en la semana, se suma 2 veces). Reglas del recetario:
 * - opcionales y sobras de otra receta ('aprovechamiento') no se compran;
 * - especias y cantidades "al gusto" se listan para revisar en la despensa.
 */
export function aggregateIngredients(recipes: Recipe[]): ShoppingLine[] {
  const totals = new Map<string, { name: string; unit: Unit; category: Category; quantity: number; recipes: Set<string> }>();
  const pantry = new Map<string, Set<string>>();

  for (const r of recipes) {
    for (const i of r.ingredients) {
      if (i.optional || i.section === 'aprovechamiento') continue;
      if (i.section === 'especias' || i.unit === 'al_gusto' || i.quantity === null) {
        if (!pantry.has(i.name)) pantry.set(i.name, new Set());
        pantry.get(i.name)!.add(r.title);
        continue;
      }
      const key = `${i.name}|${i.unit}|${i.section}`;
      const t = totals.get(key);
      if (t) {
        t.quantity += i.quantity;
        t.recipes.add(r.title);
      } else {
        totals.set(key, {
          name: i.name,
          unit: i.unit,
          category: SECTION_TO_CATEGORY[i.section],
          quantity: i.quantity,
          recipes: new Set([r.title]),
        });
      }
    }
  }

  const lines: ShoppingLine[] = [...totals.values()].map((t) => {
    const r = round(t.quantity, t.unit);
    return {
      name: capitalize(t.name),
      quantity: formatQuantity(r.quantity, r.unit),
      category: t.category,
      source: 'menu',
      recipes: [...t.recipes],
    };
  });
  for (const [name, used] of pantry) {
    lines.push({ name: capitalize(name), quantity: 'revisar', category: 'Especias', source: 'menu', recipes: [...used] });
  }

  return lines.sort(
    (a, b) => ORDER.indexOf(a.category) - ORDER.indexOf(b.category) || a.name.localeCompare(b.name, 'es'),
  );
}

/** Versión numérica (sin formatear) para validar contra datos/build.py. */
export function aggregateRaw(recipes: Recipe[]) {
  const totals = new Map<string, number>();
  for (const r of recipes)
    for (const i of r.ingredients) {
      if (i.optional || i.section === 'aprovechamiento' || i.section === 'especias' || i.unit === 'al_gusto' || i.quantity === null) continue;
      const k = `${i.name}|${i.unit}|${i.section}`;
      totals.set(k, (totals.get(k) ?? 0) + i.quantity);
    }
  return [...totals].map(([k, q]) => {
    const [name, unit, section] = k.split('|');
    const r = round(q, unit as Unit);
    return { name, section, quantity: r.quantity, unit: r.unit };
  });
}
