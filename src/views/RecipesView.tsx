import { CalendarPlus, Clock, Heart, Plus, Search, Sparkles, ThumbsDown, X } from 'lucide-react';
import { useDeferredValue, useMemo, useState } from 'react';
import { DishArt } from '../components/DishArt';
import { CATEGORY_LABEL, DIFFICULTY_LABEL, DISH_TYPE_LABEL } from '../data';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { recipeStore, useRecipes } from '../store/recipeStore';
import type { MealType, NutritionGroup, Recipe, RecipeCategory } from '../types';
import { hasVegetables } from '../utils/balance';
import { isSide } from '../utils/recommend';
import { matchesRecipe } from '../utils/search';

interface Props {
  onOpen: (recipe: Recipe) => void;
  onNew: () => void;
  onAddToMenu: (recipe: Recipe) => void;
  /** Grupos que le faltan a la semana activa y si necesita más verdura (para priorizar sugerencias). */
  needs: { groups: NutritionGroup[]; vegetables: boolean };
}

type Tab = 'recetario' | 'favoritas' | 'sugerencias';
const CATEGORY_ORDER: RecipeCategory[] = ['legumbre', 'arroz', 'pasta', 'carne', 'pescado', 'huevo', 'verdura', 'ensalada', 'masa_frito', 'guarnicion'];
const GROUP_LABEL: Record<NutritionGroup, string> = { legumbre: 'legumbre', pescado: 'pescado', carne: 'carne', huevo: 'huevo' };

export function RecipesView({ onOpen, onNew, onAddToMenu, needs }: Props) {
  const { all, favorites, editedIds, pendingSuggestions } = useRecipes();
  const [tab, setTab] = useLocalStorage<Tab>('med5:recipes:tab', 'recetario');
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const [meal, setMeal] = useLocalStorage<MealType | 'todas'>('med5:recipes:meal', 'todas');
  const [category, setCategory] = useState<RecipeCategory | null>(null);

  const source = tab === 'favoritas' ? all.filter((r) => favorites.has(r.id)) : all;
  const results = useMemo(
    () =>
      source
        .filter((r) => (meal === 'todas' || r.moments.includes(meal)) && (!category || r.category === category) && matchesRecipe(r, deferredQuery))
        .sort((a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category) || a.title.localeCompare(b.title, 'es')),
    [source, deferredQuery, meal, category],
  );

  /** Por qué una sugerencia ayuda a la semana activa. */
  const helps = (r: Recipe): string | null => {
    if (r.group && needs.groups.includes(r.group)) return `Suma ${GROUP_LABEL[r.group]} a tu semana`;
    if (needs.vegetables && isSide(r) && hasVegetables(r)) return 'Añade verdura a tu semana';
    return null;
  };
  const suggestions = [...pendingSuggestions].sort((a, b) => Number(Boolean(helps(b))) - Number(Boolean(helps(a))));

  const chip = (active: boolean) =>
    `min-h-10 shrink-0 rounded-full px-4 text-sm font-semibold transition-colors ${active ? 'bg-ink-800 text-white' : 'bg-white text-ink-500 ring-1 ring-sand-200 hover:bg-sand-100'}`;

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-400">Cocina casera · 5 personas</p>
          <h2 className="font-display text-[2.6rem] font-bold leading-[0.95] tracking-tight text-ink-900 sm:text-5xl">Recetario</h2>
        </div>
        <button type="button" onClick={onNew} className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-ink-800 px-4 text-sm font-semibold text-white hover:bg-ink-700">
          <Plus className="h-4 w-4" /> Nueva<span className="hidden sm:inline">&nbsp;receta</span>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-1 rounded-full bg-white p-1 ring-1 ring-sand-200" role="tablist">
        {(
          [
            ['recetario', `Recetas · ${all.length}`],
            ['favoritas', `Favoritas · ${favorites.size}`],
            ['sugerencias', `Sugerencias · ${pendingSuggestions.length}`],
          ] as const
        ).map(([k, l]) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={tab === k}
            onClick={() => setTab(k)}
            className={`min-h-10 rounded-full text-[13px] font-semibold ${tab === k ? 'bg-ink-800 text-white' : 'text-ink-500'}`}
          >
            {l}
          </button>
        ))}
      </div>

      {tab === 'sugerencias' ? (
        <section className="space-y-3">
          <div className="flex overflow-hidden rounded-md bg-lemon-100 text-sm text-ink-700">
            <span className="flex w-24 shrink-0 items-center bg-lemon-300 px-3 py-2 text-[11px] font-semibold leading-tight text-ink-800">Platos nuevos</span>
            <p className="px-3 py-2">
              Recetas caseras del mismo estilo que tu recetario. Acepta las que te gusten para añadirlas a tu menú; primero aparecen las que equilibran tu semana.
            </p>
          </div>
          {suggestions.length === 0 && <p className="p-8 text-center text-ink-400">Ya has revisado todas las sugerencias.</p>}
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {suggestions.map((r) => {
              const why = helps(r);
              return (
                <li key={r.id} className="flex flex-col rounded-[24px] bg-white p-4 ring-1 ring-sand-200">
                  <button type="button" onClick={() => onOpen(r)} className="flex items-center gap-3 text-left">
                    <DishArt recipe={r} size="sm" />
                    <span className="min-w-0">
                      <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-400">
                        {CATEGORY_LABEL[r.category]} · {r.moments.join(' y ')}
                      </span>
                      <span className="block font-display text-lg font-bold leading-snug text-ink-900">{r.title}</span>
                      <span className="block text-xs text-ink-400">
                        {r.prepTime + r.cookTime} min · {DIFFICULTY_LABEL[r.difficulty]}
                      </span>
                    </span>
                  </button>
                  {why && (
                    <p className="mt-2 inline-flex items-center gap-1 self-start rounded-full bg-lemon-200 px-2.5 py-1 text-xs font-semibold text-ink-800">
                      <Sparkles className="h-3.5 w-3.5" /> {why}
                    </p>
                  )}
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const accepted = recipeStore.acceptSuggestion(r.id);
                        if (accepted) onAddToMenu(accepted);
                      }}
                      className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-ink-800 text-sm font-semibold text-white"
                    >
                      <CalendarPlus className="h-4 w-4" /> Aceptar y añadir
                    </button>
                    <button
                      type="button"
                      onClick={() => recipeStore.acceptSuggestion(r.id)}
                      className="min-h-11 rounded-full px-3 text-sm font-semibold text-ink-700 ring-1 ring-sand-300"
                      title="Guardar en el recetario sin añadir al menú"
                    >
                      Guardar
                    </button>
                    <button
                      type="button"
                      onClick={() => recipeStore.dismissSuggestion(r.id)}
                      className="flex h-11 w-11 items-center justify-center rounded-full text-ink-400 ring-1 ring-sand-300 hover:text-ink-800"
                      aria-label={`Descartar ${r.title}`}
                      title="Descartar"
                    >
                      <ThumbsDown className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
          <button type="button" onClick={() => recipeStore.restoreDismissed()} className="mx-auto block min-h-10 px-4 text-sm font-medium text-ink-400 hover:text-ink-800">
            Volver a mostrar las sugerencias descartadas
          </button>
        </section>
      ) : (
        <>
          <div className="sticky top-[calc(var(--safe-area-inset-top,env(safe-area-inset-top))+3.5rem)] z-20 -mx-4 space-y-2 bg-sand-50/95 px-4 py-2 backdrop-blur md:top-16">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-300" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar: lentejas, merluza, tortilla…"
                enterKeyHint="search"
                className="h-12 w-full rounded-full border border-sand-300 bg-white pl-11 pr-11 text-base outline-none focus:border-ink-600 focus:ring-2 focus:ring-lemon-200"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-ink-400 hover:bg-sand-100"
                  aria-label="Borrar búsqueda"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </label>
            <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4">
              {(
                [
                  ['todas', 'Todas'],
                  ['comida', 'Comidas'],
                  ['cena', 'Cenas'],
                ] as const
              ).map(([k, l]) => (
                <button key={k} type="button" className={chip(meal === k)} onClick={() => setMeal(k)}>
                  {l}
                </button>
              ))}
              <span className="mx-1 w-px shrink-0 bg-sand-300" aria-hidden />
              {CATEGORY_ORDER.map((c) => (
                <button key={c} type="button" onClick={() => setCategory(category === c ? null : c)} className={chip(category === c)}>
                  {CATEGORY_LABEL[c]}
                </button>
              ))}
            </div>
          </div>

          <p className="text-sm font-medium text-ink-400" aria-live="polite">
            {results.length} receta{results.length === 1 ? '' : 's'}
          </p>

          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {results.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => onOpen(r)}
                  className="flex h-full w-full flex-col rounded-[22px] bg-white p-3 text-left ring-1 ring-sand-200 transition-shadow hover:shadow-md"
                >
                  <span className="flex items-start justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-400">{CATEGORY_LABEL[r.category]}</span>
                    {favorites.has(r.id) && <Heart className="h-4 w-4 fill-ink-900 text-ink-900" aria-label="Favorita" />}
                  </span>
                  <span className="mt-2 flex justify-center">
                    <DishArt recipe={r} size="md" />
                  </span>
                  <span className="mt-3 line-clamp-3 font-display text-[15px] font-bold leading-snug text-ink-900">{r.title}</span>
                  <span className="mt-auto flex items-center gap-1 pt-2 text-[11px] text-ink-400">
                    <Clock className="h-3.5 w-3.5" /> {r.prepTime + r.cookTime}′ · {r.dishType !== 'principal' ? DISH_TYPE_LABEL[r.dishType] : r.moments.join('/')}
                    {(editedIds.has(r.id) || r.origin === 'propia' || r.origin === 'sugerencia') && (
                      <span className="ml-auto rounded-full bg-lemon-200 px-1.5 py-0.5 text-[10px] font-semibold text-ink-800">
                        {editedIds.has(r.id) ? 'editada' : r.origin === 'propia' ? 'propia' : 'nueva'}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {results.length === 0 && (
            <div className="rounded-[24px] border border-dashed border-sand-300 p-10 text-center text-ink-400">
              {tab === 'favoritas' ? 'Marca recetas con ♥ para verlas aquí.' : 'No hay recetas con esos filtros.'}
            </div>
          )}
        </>
      )}
    </div>
  );
}
