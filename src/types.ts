export type DayKey = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo';
export type MealType = 'comida' | 'cena';
export type WeekNumber = 1 | 2 | 3 | 4;

/* ---------- Recetario (estructura de src/data/recetario.json) ---------- */

/** Secciones de supermercado del recetario. 'aprovechamiento' = sobras de otra receta (no se compran). */
export type Section =
  | 'verdura_fruta'
  | 'carne'
  | 'pescado'
  | 'huevos_lacteos'
  | 'panaderia_refrigerados'
  | 'congelados'
  | 'despensa'
  | 'especias'
  | 'aprovechamiento';

export type Unit = 'g' | 'ml' | 'ud' | 'diente' | 'cdta' | 'hoja' | 'manojo' | 'al_gusto';

export interface Ingredient {
  name: string;
  /** null cuando la unidad es 'al_gusto'. */
  quantity: number | null;
  unit: Unit;
  section: Section;
  /** Los opcionales no entran en la lista de la compra. */
  optional: boolean;
  /** Id de la receta de la que sale este ingrediente (sobras). */
  fromRecipe?: string;
}

export type RecipeCategory =
  | 'legumbre'
  | 'arroz'
  | 'pasta'
  | 'carne'
  | 'pescado'
  | 'huevo'
  | 'verdura'
  | 'ensalada'
  | 'masa_frito'
  | 'guarnicion';

export type DishType = 'principal' | 'primero' | 'guarnicion';
export type Difficulty = 'baja' | 'media' | 'alta';

export interface Recipe {
  id: string;
  title: string;
  category: RecipeCategory;
  moments: MealType[];
  dishType: DishType;
  servings: 5;
  prepTime: number;
  cookTime: number;
  difficulty: Difficulty;
  tags: string[];
  origin: 'usuario' | 'nuevo';
  ingredients: Ingredient[];
  steps: string[];
  notes: string;
  storage: string;
  /** Sobras que genera para otras recetas (p. ej. caldo de cocido). */
  generates: string[];
  image: string;
}

export interface DayPlan {
  day: DayKey;
  comida: string[];
  cena: string[];
}

export interface WeekPlan {
  week: WeekNumber;
  days: DayPlan[];
}

/* ---------- Lista de la compra ---------- */

export const CATEGORIES = [
  'Verdura y fruta',
  'Carne',
  'Pescado',
  'Huevos y lácteos',
  'Panadería y refrigerados',
  'Congelados',
  'Despensa',
  'Especias',
  'Hogar y otros',
] as const;
export type Category = (typeof CATEGORIES)[number];

export type ItemSource = 'menu' | 'manual';

export interface ShoppingItem {
  id: string;
  listId: string;
  name: string;
  quantity: string;
  category: Category;
  checked: boolean;
  addedBy: string;
  source: ItemSource;
  createdAt: string;
  checkedAt: string | null;
  checkedBy: string | null;
}

export interface ShoppingList {
  id: string;
  household: string;
  name: string;
  status: 'active' | 'archived';
  createdBy: string;
  createdAt: string;
  completedAt: string | null;
  itemCount: number;
}

export interface HouseholdState {
  activeList: ShoppingList | null;
  items: ShoppingItem[];
  history: ShoppingList[];
}

export interface NewItemInput {
  name: string;
  quantity: string;
  category: Category;
  source: ItemSource;
}
