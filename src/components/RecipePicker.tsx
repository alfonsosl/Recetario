import { Check, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ALL_RECIPES } from '../data';
import { useBackToClose } from '../hooks/useBackToClose';
import type { DayKey, MealType, WeekNumber } from '../types';
import { dayLabel } from '../utils/days';
import { matchesRecipe } from '../utils/search';
import { RecipeImage } from './RecipeImage';

interface Props {
  week: WeekNumber;
  day: DayKey;
  meal: MealType;
  currentId: string;
  onSelect: (recipeId: string) => void;
  onClose: () => void;
}

type Filter = MealType | 'todas';

/** Selector para intercambiar una comida/cena por cualquiera de las 56 recetas. */
export function RecipePicker({ week, day, meal, currentId, onSelect, onClose }: Props) {
  const requestClose = useBackToClose(onClose);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>(meal);
  const originalId = `w${week}-${day}-${meal}`;

  const results = useMemo(
    () => ALL_RECIPES.filter((r) => (filter === 'todas' || r.meal === filter) && matchesRecipe(r, query)),
    [query, filter],
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6" role="dialog" aria-modal="true" aria-label="Cambiar plato">
      <div className="animate-fade-in absolute inset-0 bg-stone-900/50" onClick={() => requestClose()} aria-hidden />
      <div className="animate-sheet-up relative flex h-full w-full flex-col bg-sand-50 md:h-[85vh] md:max-w-2xl md:rounded-3xl md:shadow-2xl">
        <header className="pt-safe border-b border-sand-200 bg-sand-50">
          <div className="flex items-center gap-2 px-2 py-2">
            <button
              type="button"
              onClick={() => requestClose()}
              className="flex h-12 w-12 items-center justify-center rounded-full hover:bg-sand-200"
              aria-label="Cerrar"
            >
              <X className="h-7 w-7" />
            </button>
            <div className="min-w-0">
              <h2 className="font-display text-lg font-semibold text-olive-900">Cambiar plato</h2>
              <p className="text-sm text-stone-500">
                Semana {week} · {dayLabel(day)} · {meal === 'comida' ? 'Comida' : 'Cena'}
              </p>
            </div>
          </div>
          <div className="space-y-2 px-3 pb-3">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar plato o ingrediente…"
                className="h-12 w-full rounded-xl border border-sand-300 bg-white pl-10 pr-3 text-base outline-none focus:border-olive-500 focus:ring-2 focus:ring-olive-200"
              />
            </label>
            <div className="flex gap-2">
              {(
                [
                  ['comida', 'Comidas'],
                  ['cena', 'Cenas'],
                  ['todas', 'Todas'],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilter(key)}
                  className={`min-h-10 flex-1 rounded-full text-sm font-semibold ${
                    filter === key ? 'bg-olive-600 text-white' : 'bg-white text-stone-600 ring-1 ring-sand-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </header>

        <ul className="pb-safe flex-1 space-y-2 overflow-y-auto overscroll-contain p-3">
          {results.map((r) => {
            const selected = r.id === currentId;
            return (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(r.id);
                    requestClose();
                  }}
                  className={`flex w-full items-center gap-3 rounded-2xl border p-2 text-left transition-colors ${
                    selected ? 'border-olive-500 bg-olive-50' : 'border-sand-200 bg-white hover:bg-sand-100'
                  }`}
                >
                  <RecipeImage src={r.image} alt={r.title} width={160} sizes="80px" className="h-16 w-16 shrink-0 rounded-xl" />
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 font-semibold leading-snug text-stone-800">{r.title}</span>
                    <span className="mt-0.5 block text-xs text-stone-500">
                      S{r.week} · {dayLabel(r.day)} · {r.meal === 'comida' ? 'Comida' : 'Cena'} · {r.prepTime + r.cookTime} min
                      {r.id === originalId && ' · Original'}
                    </span>
                  </span>
                  {selected && <Check className="mr-2 h-6 w-6 shrink-0 text-olive-600" />}
                </button>
              </li>
            );
          })}
          {results.length === 0 && <li className="p-8 text-center text-stone-500">No hay recetas que coincidan.</li>}
        </ul>
      </div>
    </div>
  );
}
