export type DayKey = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo';
export type MealType = 'comida' | 'cena';
export type WeekNumber = 1 | 2 | 3 | 4;

export const CATEGORIES = [
  'Verduras y Hortalizas',
  'Carnes y Aves',
  'Pescados y Mariscos',
  'Legumbres y Cereales',
  'Huevos y Lácteos',
  'Despensa y AOVE',
  'Hogar y Otros',
] as const;
export type Category = (typeof CATEGORIES)[number];

export type Unit =
  | 'g'
  | 'ml'
  | 'ud'
  | 'diente'
  | 'cda'
  | 'cdta'
  | 'hoja'
  | 'rama'
  | 'sobre'
  | 'lata'
  | 'bote'
  | 'al gusto';

export interface Ingredient {
  name: string;
  quantity: number;
  unit: Unit;
  category: Category;
  /** Aclaración opcional (corte, estado, alternativa). */
  note?: string;
  /** Ingrediente de grifo/básico que no se añade a la lista de la compra (p. ej. agua). */
  pantry?: boolean;
}

export type Difficulty = 'Fácil' | 'Media' | 'Elaborada';

export interface Recipe {
  id: string;
  week: WeekNumber;
  day: DayKey;
  meal: MealType;
  title: string;
  description: string;
  servings: 5;
  prepTime: number;
  cookTime: number;
  difficulty: Difficulty;
  image: string;
  tags: string[];
  ingredients: Ingredient[];
  steps: string[];
}

export interface WeekMenu {
  week: WeekNumber;
  recipes: Recipe[];
}

/* ---------- Lista de la compra ---------- */

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
