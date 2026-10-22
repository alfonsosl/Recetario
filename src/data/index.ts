import type { DayKey, MealType, Recipe, WeekNumber } from '../types';
import { week1 } from './week1';
import { week2 } from './week2';
import { week3 } from './week3';
import { week4 } from './week4';

export { week1, week2, week3, week4 };

export const WEEKS: Record<WeekNumber, Recipe[]> = { 1: week1, 2: week2, 3: week3, 4: week4 };

export const ALL_RECIPES: Recipe[] = [...week1, ...week2, ...week3, ...week4];

const BY_ID = new Map(ALL_RECIPES.map((r) => [r.id, r]));

export const getRecipeById = (id: string): Recipe | undefined => BY_ID.get(id);

export const getDefaultRecipe = (week: WeekNumber, day: DayKey, meal: MealType): Recipe => {
  const recipe = BY_ID.get(`w${week}-${day}-${meal}`);
  if (!recipe) throw new Error(`Receta no encontrada: semana ${week}, ${day}, ${meal}`);
  return recipe;
};
