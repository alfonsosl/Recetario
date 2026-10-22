import type { Category } from '../types';

export const CATEGORY_META: Record<Category, { emoji: string; short: string; tone: string }> = {
  'Verduras y Hortalizas': { emoji: '🥬', short: 'Verduras', tone: 'bg-olive-50 text-olive-800' },
  'Carnes y Aves': { emoji: '🍗', short: 'Carnes', tone: 'bg-terra-50 text-terra-700' },
  'Pescados y Mariscos': { emoji: '🐟', short: 'Pescados', tone: 'bg-sea-50 text-sea-700' },
  'Legumbres y Cereales': { emoji: '🌾', short: 'Legumbres', tone: 'bg-amber-50 text-amber-800' },
  'Huevos y Lácteos': { emoji: '🥚', short: 'Lácteos', tone: 'bg-yellow-50 text-yellow-800' },
  'Despensa y AOVE': { emoji: '🫒', short: 'Despensa', tone: 'bg-lime-50 text-lime-800' },
  'Hogar y Otros': { emoji: '🧻', short: 'Hogar', tone: 'bg-stone-100 text-stone-700' },
};
