import { Check, Search, Sparkles, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { CATEGORY_LABEL, DISH_TYPE_LABEL } from '../data';
import { useBackToClose } from '../hooks/useBackToClose';
import { useRecipes } from '../store/recipeStore';
import type { DayKey, MealType, Recipe, WeekNumber } from '../types';
import { dayLabel } from '../utils/days';
import { recommendSides } from '../utils/recommend';
import { matchesRecipe } from '../utils/search';
import { DishArt } from './DishArt';

interface Props {
  mode: 'swap' | 'add';
  week: WeekNumber;
  day: DayKey;
  meal: MealType;
  /** Platos actuales de esa comida/cena. */
  current: Recipe[];
  /** En modo 'swap': el plato que se sustituye. */
  currentId?: string;
  originalId?: string;
  onSelect: (recipe: Recipe) => void;
  onClose: () => void;
}

type Filter = MealType | 'todas';

/** Selector para cambiar un plato o añadir un acompañamiento. */
export function RecipePicker({ mode, week, day, meal, current, currentId, originalId, onSelect, onClose }: Props) {
  const requestClose = useBackToClose(onClose);
  const { all } = useRecipes();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>(meal);

  const recommended = useMemo(() => (mode === 'add' ? recommendSides(current, all, meal).slice(0, 6) : []), [mode, current, all, meal]);
  const results = useMemo(
    () => all.filter((r) => (filter === 'todas' || r.moments.includes(filter)) && matchesRecipe(r, query)),
    [all, query, filter],
  );

  const row = (r: Recipe) => {
    const selected = r.id === currentId;
    return (
      <li key={r.id}>
        <button
          type="button"
          onClick={() => {
            onSelect(r);
            requestClose();
          }}
          className={`flex w-full items-center gap-3 rounded-2xl p-2 text-left transition-colors ${selected ? 'bg-lemon-100 ring-1 ring-lemon-300' : 'bg-white hover:bg-sand-100'}`}
        >
          <DishArt recipe={r} size="xs" />
          <span className="min-w-0 flex-1">
            <span className="line-clamp-2 font-display text-[15px] font-bold leading-snug text-ink-900">{r.title}</span>
            <span className="mt-0.5 block text-xs text-ink-400">
              {CATEGORY_LABEL[r.category]} · {DISH_TYPE_LABEL[r.dishType]} · {r.prepTime + r.cookTime} min
              {r.id === originalId && ' · Original'}
            </span>
          </span>
          {selected && <Check className="mr-2 h-5 w-5 shrink-0 text-ink-800" />}
        </button>
      </li>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6" role="dialog" aria-modal="true" aria-label={mode === 'add' ? 'Añadir plato' : 'Cambiar plato'}>
      <div className="animate-fade-in absolute inset-0 bg-ink-900/40" onClick={() => requestClose()} aria-hidden />
      <div className="animate-sheet-up relative flex h-full w-full flex-col bg-sand-50 md:h-[85vh] md:max-w-2xl md:rounded-[28px] md:shadow-2xl">
        <header className="pt-safe border-b border-sand-200">
          <div className="flex items-center gap-2 px-2 py-2">
            <button type="button" onClick={() => requestClose()} className="flex h-12 w-12 items-center justify-center rounded-full hover:bg-sand-100" aria-label="Cerrar">
              <X className="h-7 w-7" />
            </button>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-400">
                Semana {week} · {dayLabel(day)} · {meal === 'comida' ? 'Comida' : 'Cena'}
              </p>
              <h2 className="font-display text-xl font-bold text-ink-900">{mode === 'add' ? 'Añadir acompañamiento' : 'Cambiar plato'}</h2>
            </div>
          </div>
          <div className="space-y-2 px-3 pb-3">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-300" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar plato o ingrediente…"
                className="h-12 w-full rounded-full border border-sand-300 bg-white pl-10 pr-3 text-base outline-none focus:border-ink-600 focus:ring-2 focus:ring-lemon-200"
              />
            </label>
            <div className="flex gap-2">
              {(
                [
                  ['comida', 'De comida'],
                  ['cena', 'De cena'],
                  ['todas', 'Todas'],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilter(key)}
                  className={`min-h-10 flex-1 rounded-full text-sm font-semibold ${filter === key ? 'bg-ink-800 text-white' : 'bg-white text-ink-500 ring-1 ring-sand-200'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </header>

        <div className="pb-safe flex-1 space-y-4 overflow-y-auto overscroll-contain p-3">
          {recommended.length > 0 && !query && (
            <section>
              <p className="mb-2 flex items-center gap-1.5 px-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-500">
                <Sparkles className="h-3.5 w-3.5" /> Recomendados para acompañar {current.map((c) => c.title).join(' y ')}
              </p>
              <ul className="space-y-2">{recommended.map(row)}</ul>
            </section>
          )}
          <section>
            {recommended.length > 0 && !query && <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-400">Todo el recetario</p>}
            <ul className="space-y-2">{results.map(row)}</ul>
            {results.length === 0 && <p className="p-8 text-center text-ink-400">No hay recetas que coincidan.</p>}
          </section>
        </div>
      </div>
    </div>
  );
}
