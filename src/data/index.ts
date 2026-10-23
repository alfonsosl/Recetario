import type { DayKey, Difficulty, DishType, Ingredient, MealType, Recipe, RecipeCategory, Section, Unit, WeekNumber, WeekPlan } from '../types';
import { imageFor } from './images';
import raw from './recetario.json';

/**
 * Fuente única de datos: src/data/recetario.json, generado con datos/build.py
 * (recetas en datos/recetas_data.py). Aquí solo se adapta al formato de la app.
 */

interface RawIngredient {
  nombre: string;
  cantidad: number | null;
  unidad: string;
  seccion: string;
  opcional: boolean;
  de_receta?: string;
}

interface RawRecipe {
  id: string;
  nombre: string;
  categoria: string;
  momento: string[];
  tipo_plato: string;
  raciones: number;
  tiempo_prep_min: number;
  tiempo_coccion_min: number;
  dificultad: string;
  etiquetas: string[];
  origen: string;
  ingredientes: RawIngredient[];
  pasos: string[];
  notas: string;
  conservacion: string;
  genera: string[];
}

interface RawPlan {
  semana: number;
  dias: { dia: string; comida: string[]; cena: string[] }[];
}

interface RawData {
  meta: {
    notas: string[];
    criterios_plan: string[];
    balance_semanal: { semana: number; legumbre: number; pescado: number; carne: number; huevo: number }[];
  };
  recetas: RawRecipe[];
  plan_mensual: RawPlan[];
}

const data = raw as unknown as RawData;

const toDayKey = (dia: string) => dia.normalize('NFD').replace(/[̀-ͯ]/g, '') as DayKey;

const toIngredient = (i: RawIngredient): Ingredient => ({
  name: i.nombre,
  quantity: i.cantidad,
  unit: i.unidad as Unit,
  section: i.seccion as Section,
  optional: i.opcional,
  ...(i.de_receta ? { fromRecipe: i.de_receta } : {}),
});

export const ALL_RECIPES: Recipe[] = data.recetas.map((r) => ({
  id: r.id,
  title: r.nombre,
  category: r.categoria as RecipeCategory,
  moments: r.momento as MealType[],
  dishType: r.tipo_plato as DishType,
  servings: 5,
  prepTime: r.tiempo_prep_min,
  cookTime: r.tiempo_coccion_min,
  difficulty: r.dificultad as Difficulty,
  tags: r.etiquetas,
  origin: r.origen as Recipe['origin'],
  ingredients: r.ingredientes.map(toIngredient),
  steps: r.pasos,
  notes: r.notas,
  storage: r.conservacion,
  generates: r.genera,
  image: imageFor(r.id, r.categoria as RecipeCategory),
}));

const BY_ID = new Map(ALL_RECIPES.map((r) => [r.id, r]));

export const getRecipeById = (id: string): Recipe | undefined => BY_ID.get(id);

export const PLAN: WeekPlan[] = data.plan_mensual.map((s) => ({
  week: s.semana as WeekNumber,
  days: s.dias.map((d) => ({ day: toDayKey(d.dia), comida: d.comida, cena: d.cena })),
}));

export const getDefaultSlot = (week: WeekNumber, day: DayKey, meal: MealType): string[] => {
  const d = PLAN.find((w) => w.week === week)?.days.find((x) => x.day === day);
  if (!d) throw new Error(`Plan no encontrado: semana ${week}, ${day}`);
  return d[meal];
};

export const META = {
  notes: data.meta.notas,
  planCriteria: data.meta.criterios_plan,
};

export const CATEGORY_LABEL: Record<RecipeCategory, string> = {
  legumbre: 'Legumbre',
  arroz: 'Arroz',
  pasta: 'Pasta',
  carne: 'Carne',
  pescado: 'Pescado',
  huevo: 'Huevo',
  verdura: 'Verdura',
  ensalada: 'Ensalada',
  masa_frito: 'Masas y fritos',
  guarnicion: 'Guarnición',
};

export const DISH_TYPE_LABEL: Record<DishType, string> = {
  principal: 'Plato principal',
  primero: 'Primero',
  guarnicion: 'Guarnición',
};

export const DIFFICULTY_LABEL: Record<Difficulty, string> = { baja: 'Fácil', media: 'Media', alta: 'Elaborada' };

/** Grupo nutricional del plato para el balance semanal (misma lógica que datos/build.py). */
export function nutritionGroup(id: string): 'legumbre' | 'pescado' | 'carne' | 'huevo' | null {
  const r = BY_ID.get(id);
  if (!r) return null;
  if (id === 'cocido' || id === 'ropa_vieja' || (r.category === 'legumbre' && id !== 'sopa_picadillo')) return 'legumbre';
  if (r.category === 'pescado' || ['croquetas_bacalao', 'empanada_atun', 'arroz_pescado'].includes(id)) return 'pescado';
  if (
    r.category === 'carne' ||
    [
      'croquetas_cocido',
      'croquetas_pollo',
      'arroz_pollo',
      'arroz_chorizo',
      'macarrones_bolonesa',
      'lasana_carne',
      'berenjenas_rellenas',
      'ensalada_pollo_mayonesa',
      'espaguetis_carbonara',
      'hamburguesas_caseras',
    ].includes(id)
  )
    return 'carne';
  if (r.category === 'huevo' || id === 'pisto_huevo') return 'huevo';
  return null;
}
