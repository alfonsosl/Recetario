import { useSyncExternalStore } from 'react';
import { BASE_RECIPES, SUGGESTIONS } from '../data';
import type { Recipe } from '../types';

/**
 * Recetario editable. Combina:
 * - el recetario base (recetario.json, solo lectura),
 * - las ediciones del usuario sobre recetas base (se pueden restaurar),
 * - recetas propias y sugerencias aceptadas.
 * Se guarda en este dispositivo (localStorage).
 */

interface PersistedState {
  edited: Record<string, Recipe>;
  custom: Record<string, Recipe>;
  favorites: string[];
  dismissedSuggestions: string[];
}

export interface RecipeSnapshot {
  all: Recipe[];
  byId: Map<string, Recipe>;
  editedIds: Set<string>;
  favorites: Set<string>;
  /** Sugerencias pendientes (ni aceptadas ni descartadas). */
  pendingSuggestions: Recipe[];
}

const KEY = 'med5:recipes:v1';
const BASE_IDS = new Set(BASE_RECIPES.map((r) => r.id));
const EMPTY: PersistedState = { edited: {}, custom: {}, favorites: [], dismissedSuggestions: [] };

function load(): PersistedState {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...EMPTY, ...(JSON.parse(raw) as PersistedState) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

let state: PersistedState = load();
let snapshot: RecipeSnapshot = build(state);
const listeners = new Set<() => void>();

function build(s: PersistedState): RecipeSnapshot {
  const all = [...BASE_RECIPES.map((r) => s.edited[r.id] ?? r), ...Object.values(s.custom)];
  const byId = new Map(all.map((r) => [r.id, r]));
  return {
    all,
    byId,
    editedIds: new Set(Object.keys(s.edited)),
    favorites: new Set(s.favorites),
    pendingSuggestions: SUGGESTIONS.filter((r) => !s.custom[r.id] && !s.dismissedSuggestions.includes(r.id)),
  };
}

function commit(next: PersistedState) {
  state = next;
  snapshot = build(state);
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* almacenamiento lleno o bloqueado */
  }
  listeners.forEach((l) => l());
}

export const recipeStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot: () => snapshot,
  getById: (id: string) => snapshot.byId.get(id),
  isBase: (id: string) => BASE_IDS.has(id),

  /** Guarda una receta: si es del recetario base queda como edición; si no, como receta propia. */
  save(recipe: Recipe) {
    if (BASE_IDS.has(recipe.id)) commit({ ...state, edited: { ...state.edited, [recipe.id]: recipe } });
    else commit({ ...state, custom: { ...state.custom, [recipe.id]: recipe } });
  },
  /** Vuelve a la versión original del recetario base. */
  restore(id: string) {
    const edited = { ...state.edited };
    delete edited[id];
    commit({ ...state, edited });
  },
  /** Elimina una receta propia o una sugerencia aceptada (vuelve a quedar como sugerencia). */
  remove(id: string) {
    const custom = { ...state.custom };
    delete custom[id];
    commit({ ...state, custom, favorites: state.favorites.filter((f) => f !== id) });
  },
  acceptSuggestion(id: string): Recipe | undefined {
    const s = SUGGESTIONS.find((r) => r.id === id);
    if (!s) return undefined;
    if (!state.custom[id]) commit({ ...state, custom: { ...state.custom, [id]: s } });
    return s;
  },
  dismissSuggestion(id: string) {
    commit({ ...state, dismissedSuggestions: [...new Set([...state.dismissedSuggestions, id])] });
  },
  restoreDismissed() {
    commit({ ...state, dismissedSuggestions: [] });
  },
  toggleFavorite(id: string) {
    const has = state.favorites.includes(id);
    commit({ ...state, favorites: has ? state.favorites.filter((f) => f !== id) : [...state.favorites, id] });
  },
};

export function useRecipes(): RecipeSnapshot {
  return useSyncExternalStore(recipeStore.subscribe, recipeStore.getSnapshot, recipeStore.getSnapshot);
}
