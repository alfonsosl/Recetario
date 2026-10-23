import type { Category, Section } from '../types';

/** Sección del recetario → categoría (pasillo) de la lista de la compra. */
export const SECTION_TO_CATEGORY: Record<Exclude<Section, 'aprovechamiento'>, Category> = {
  verdura_fruta: 'Verdura y fruta',
  carne: 'Carne',
  pescado: 'Pescado',
  huevos_lacteos: 'Huevos y lácteos',
  panaderia_refrigerados: 'Panadería y refrigerados',
  congelados: 'Congelados',
  despensa: 'Despensa',
  especias: 'Especias',
};

export const CATEGORY_META: Record<Category, { emoji: string; short: string; tone: string }> = {
  'Verdura y fruta': { emoji: '🥬', short: 'Verdura', tone: 'bg-ink-50 text-ink-800' },
  Carne: { emoji: '🍗', short: 'Carne', tone: 'bg-lemon-50 text-lemon-700' },
  Pescado: { emoji: '🐟', short: 'Pescado', tone: 'bg-ink-50 text-ink-700' },
  'Huevos y lácteos': { emoji: '🥚', short: 'Lácteos', tone: 'bg-yellow-50 text-yellow-800' },
  'Panadería y refrigerados': { emoji: '🥖', short: 'Panadería', tone: 'bg-amber-50 text-amber-800' },
  Congelados: { emoji: '🧊', short: 'Congelados', tone: 'bg-sky-50 text-sky-800' },
  Despensa: { emoji: '🫒', short: 'Despensa', tone: 'bg-lime-50 text-lime-800' },
  Especias: { emoji: '🧂', short: 'Especias', tone: 'bg-orange-50 text-orange-800' },
  'Hogar y otros': { emoji: '🧻', short: 'Hogar', tone: 'bg-ink-100 text-ink-700' },
};

/** Listas guardadas con categorías antiguas se reagrupan en "Hogar y otros" para no perder productos. */
export const normalizeCategory = (c: string): Category => (c in CATEGORY_META ? (c as Category) : 'Hogar y otros');
