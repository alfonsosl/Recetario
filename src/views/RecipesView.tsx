import { Clock, Moon, Search, Sun, X } from 'lucide-react';
import { useDeferredValue, useMemo, useState } from 'react';
import { RecipeImage } from '../components/RecipeImage';
import { ALL_RECIPES } from '../data';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { MealType, Recipe, WeekNumber } from '../types';
import { dayLabel } from '../utils/days';
import { matchesRecipe } from '../utils/search';

interface Props {
  onOpen: (recipe: Recipe) => void;
}

const QUICK_TAGS = ['Legumbres', 'Pescado azul', 'Pescado blanco', 'Arroz', 'Pasta', 'Huevos', 'Aves', 'Vegetariana', 'Rápida', 'Cena ligera'];

export function RecipesView({ onOpen }: Props) {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const [meal, setMeal] = useLocalStorage<MealType | 'todas'>('med5:recipes:meal', 'todas');
  const [week, setWeek] = useLocalStorage<WeekNumber | 0>('med5:recipes:week', 0);
  const [tag, setTag] = useState<string | null>(null);

  const results = useMemo(
    () =>
      ALL_RECIPES.filter(
        (r) =>
          (meal === 'todas' || r.meal === meal) &&
          (week === 0 || r.week === week) &&
          (!tag || r.tags.includes(tag)) &&
          matchesRecipe(r, deferredQuery),
      ),
    [deferredQuery, meal, week, tag],
  );

  const chip = (active: boolean) =>
    `min-h-10 shrink-0 rounded-full px-4 text-sm font-semibold transition-colors ${
      active ? 'bg-olive-600 text-white' : 'bg-white text-stone-600 ring-1 ring-sand-200 hover:bg-sand-100'
    }`;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-2xl font-semibold text-olive-900">Recetario</h2>
        <p className="text-sm text-stone-500">56 platos de dieta mediterránea · cantidades para 5 personas</p>
      </div>

      <div className="sticky top-[calc(env(safe-area-inset-top)+3.5rem)] z-20 -mx-4 space-y-2 bg-sand-50/95 px-4 py-2 backdrop-blur md:top-16">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar: lentejas, salmón, garbanzos…"
            enterKeyHint="search"
            className="h-12 w-full rounded-2xl border border-sand-300 bg-white pl-11 pr-11 text-base outline-none focus:border-olive-500 focus:ring-2 focus:ring-olive-200"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-stone-400 hover:bg-sand-100"
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
          {([0, 1, 2, 3, 4] as const).map((w) => (
            <button key={w} type="button" className={chip(week === w)} onClick={() => setWeek(w)}>
              {w === 0 ? 'Todas las semanas' : `Semana ${w}`}
            </button>
          ))}
        </div>
        <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4">
          {QUICK_TAGS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTag(tag === t ? null : t)}
              className={`min-h-9 shrink-0 rounded-full px-3 text-xs font-semibold ${
                tag === t ? 'bg-terra-500 text-white' : 'bg-terra-50 text-terra-700'
              }`}
            >
              #{t}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm font-medium text-stone-500" aria-live="polite">
        {results.length} receta{results.length === 1 ? '' : 's'}
      </p>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {results.map((r) => (
          <li key={r.id}>
            <button
              type="button"
              onClick={() => onOpen(r)}
              className="flex w-full gap-3 overflow-hidden rounded-3xl border border-sand-200 bg-white p-2 text-left shadow-sm transition-shadow hover:shadow-md sm:flex-col sm:p-0"
            >
              <RecipeImage
                src={r.image}
                alt={r.title}
                width={480}
                sizes="(min-width: 640px) 33vw, 112px"
                className="h-28 w-28 shrink-0 rounded-2xl sm:aspect-[16/10] sm:h-auto sm:w-full sm:rounded-none"
              />
              <span className="flex min-w-0 flex-1 flex-col justify-center sm:p-4">
                <span className={`flex items-center gap-1 text-xs font-semibold uppercase tracking-wide ${r.meal === 'comida' ? 'text-terra-600' : 'text-sea-600'}`}>
                  {r.meal === 'comida' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                  S{r.week} · {dayLabel(r.day)}
                </span>
                <span className="mt-1 line-clamp-3 font-display text-base font-semibold leading-snug text-stone-900">{r.title}</span>
                <span className="mt-1.5 flex items-center gap-1 text-xs text-stone-500">
                  <Clock className="h-3.5 w-3.5" /> {r.prepTime + r.cookTime} min · {r.difficulty}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      {results.length === 0 && (
        <div className="rounded-3xl border border-dashed border-sand-300 p-10 text-center text-stone-500">
          No hay recetas con esos filtros.
          <button
            type="button"
            className="mt-3 block w-full font-semibold text-olive-700"
            onClick={() => {
              setQuery('');
              setMeal('todas');
              setWeek(0);
              setTag(null);
            }}
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
}
