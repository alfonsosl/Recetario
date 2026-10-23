import type { DayKey, Difficulty, DishType, Ingredient, MealType, NutritionGroup, Recipe, RecipeCategory, Section, Unit, WeekNumber, WeekPlan } from '../types';
import raw from './recetario.json';
import rawSuggestions from './sugerencias.json';

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
  grupo?: NutritionGroup | null;
  emoji?: string;
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

/** Icono por receta (el recetario no trae fotos; los emojis son símbolos, no imágenes reales). */
const EMOJI_BY_ID: Record<string, string> = {
  lentejas_verduras: '🍲', cocido: '🍲', garbanzos_espinacas: '🥬', alubias_verduras: '🍲', ropa_vieja: '🍖',
  sopa_picadillo: '🥣', arroz_blanco: '🍚', arroz_pescado: '🥘', arroz_pollo: '🥘', arroz_chorizo: '🥘',
  macarrones_bolonesa: '🍝', espaguetis_carbonara: '🍝', lasana_carne: '🍝', ensalada_pasta: '🥗',
  filetes_empanados: '🍗', carne_con_patatas: '🥩', pollo_horno_patatas: '🍗', pollo_ajillo: '🍗',
  albondigas_salsa: '🧆', lomo_plancha: '🥩', pechuga_plancha: '🍗', hamburguesas_caseras: '🍔',
  berenjenas_rellenas: '🍆', salmon_horno_patatas: '🐟', pez_espada_plancha: '🐟', dorada_frita: '🐟',
  merluza_salsa_verde: '🐟', bacalao_tomate: '🐟', boquerones_fritos: '🐟', sepia_plancha: '🦑',
  croquetas_cocido: '🥟', croquetas_bacalao: '🥟', croquetas_pollo: '🥟', huevos_fritos: '🍳',
  tortilla_francesa: '🥚', tortilla_patatas: '🥔', revuelto_champinones: '🍄', pisto_huevo: '🍅',
  patatas_fritas: '🍟', judias_verdes_patatas: '🥬', crema_calabacin: '🥣', crema_calabaza: '🎃',
  ensalada_mixta: '🥗', ensalada_pollo_mayonesa: '🥗', empanada_atun: '🥧', empanada_queso: '🥧', pizza_casera: '🍕',
};

export const CATEGORY_EMOJI: Record<RecipeCategory, string> = {
  legumbre: '🍲', arroz: '🥘', pasta: '🍝', carne: '🥩', pescado: '🐟', huevo: '🥚',
  verdura: '🥦', ensalada: '🥗', masa_frito: '🥧', guarnicion: '🍽️',
};

/** Emojis disponibles en el editor (Unicode ≤ 12, compatibles con Android 7+). */
export const EMOJI_CHOICES = ['🍲', '🥘', '🍛', '🍚', '🍝', '🥣', '🥗', '🥬', '🥦', '🍅', '🥔', '🍆', '🎃', '🥒', '🥕', '🍄', '🐟', '🦑', '🍤', '🥩', '🍗', '🍖', '🧆', '🍔', '🍕', '🥧', '🥟', '🍳', '🥚', '🍟', '🥖', '🧀', '🍽️'];

/** Grupo nutricional de las recetas base (misma lógica que datos/build.py → grupo()). */
function baseGroup(id: string, category: string): NutritionGroup | null {
  if (id === 'cocido' || id === 'ropa_vieja' || (category === 'legumbre' && id !== 'sopa_picadillo')) return 'legumbre';
  if (category === 'pescado' || ['croquetas_bacalao', 'empanada_atun', 'arroz_pescado'].includes(id)) return 'pescado';
  if (
    category === 'carne' ||
    ['croquetas_cocido', 'croquetas_pollo', 'arroz_pollo', 'arroz_chorizo', 'macarrones_bolonesa', 'lasana_carne',
      'berenjenas_rellenas', 'ensalada_pollo_mayonesa', 'espaguetis_carbonara', 'hamburguesas_caseras'].includes(id)
  )
    return 'carne';
  if (category === 'huevo' || id === 'pisto_huevo') return 'huevo';
  return null;
}

const toRecipe = (r: RawRecipe): Recipe => ({
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
  group: r.grupo !== undefined ? r.grupo : baseGroup(r.id, r.categoria),
  emoji: r.emoji ?? EMOJI_BY_ID[r.id] ?? CATEGORY_EMOJI[r.categoria as RecipeCategory],
  ingredients: r.ingredientes.map(toIngredient),
  steps: r.pasos,
  notes: r.notas,
  storage: r.conservacion,
  generates: r.genera,
});

/** Recetario base (src/data/recetario.json). Las ediciones del usuario viven en store/recipeStore. */
export const BASE_RECIPES: Recipe[] = data.recetas.map(toRecipe);

/** Sugerencias de platos del mismo estilo (src/data/sugerencias.json, generado con datos/sugerencias_data.py). */
export const SUGGESTIONS: Recipe[] = (rawSuggestions as unknown as { sugerencias: RawRecipe[] }).sugerencias.map(toRecipe);

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
