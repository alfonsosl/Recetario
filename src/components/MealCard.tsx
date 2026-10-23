import { ArrowLeftRight, Moon, Plus, Sun, X } from 'lucide-react';
import { DISH_TYPE_LABEL } from '../data';
import { MAX_DISHES } from '../hooks/usePlanner';
import type { MealType, Recipe } from '../types';
import { DishArt } from './DishArt';

interface Props {
  dishes: Recipe[];
  meal: MealType;
  swapped: boolean;
  onOpen: (recipe: Recipe, index: number) => void;
  onSwap: (index: number) => void;
  onRemove: (index: number) => void;
  onAdd: () => void;
  compact?: boolean;
}

/** Comida o cena del calendario: normalmente un primero/acompañamiento y un segundo. */
export function MealCard({ dishes, meal, swapped, onOpen, onSwap, onRemove, onAdd, compact = false }: Props) {
  const MealIcon = meal === 'comida' ? Sun : Moon;
  const label = meal === 'comida' ? 'Comida' : 'Cena';
  const totalTime = Math.max(...dishes.map((d) => d.prepTime + d.cookTime));
  const canAdd = dishes.length < MAX_DISHES;

  if (compact) {
    return (
      <article className="rounded-2xl bg-white p-2 shadow-[0_1px_0_rgba(0,0,0,0.04)] ring-1 ring-sand-200">
        <p className="flex items-center gap-1 px-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-400">
          <MealIcon className="h-3 w-3" /> {label}
          {swapped && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-lemon-400" title="Cambiado" />}
        </p>
        <ul className="mt-1 space-y-1">
          {dishes.map((d, i) => (
            <li key={`${d.id}-${i}`} className="group flex items-center gap-1.5">
              <button type="button" onClick={() => onOpen(d, i)} className="flex min-w-0 flex-1 items-center gap-1.5 rounded-lg p-1 text-left hover:bg-sand-50" aria-label={`Ver receta: ${d.title}`}>
                <DishArt recipe={d} size="xs" />
                <span className="line-clamp-3 font-display text-[12px] font-semibold leading-tight text-ink-900 hyphens-auto break-words">{d.title}</span>
              </button>
              <span className="flex flex-col opacity-60 group-hover:opacity-100">
                <button type="button" onClick={() => onSwap(i)} title="Cambiar plato" aria-label={`Cambiar ${d.title}`} className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-sand-100">
                  <ArrowLeftRight className="h-3 w-3" />
                </button>
                {dishes.length > 1 && (
                  <button type="button" onClick={() => onRemove(i)} title="Quitar plato" aria-label={`Quitar ${d.title}`} className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-sand-100">
                    <X className="h-3 w-3" />
                  </button>
                )}
              </span>
            </li>
          ))}
        </ul>
        {canAdd && (
          <button type="button" onClick={onAdd} className="mt-1 flex h-8 w-full items-center justify-center gap-1 rounded-lg text-[11px] font-semibold text-ink-400 hover:bg-sand-50 hover:text-ink-800">
            <Plus className="h-3.5 w-3.5" /> Acompañamiento
          </button>
        )}
      </article>
    );
  }

  return (
    <article className="rounded-[24px] bg-white p-4 shadow-[0_1px_0_rgba(0,0,0,0.04)] ring-1 ring-sand-200">
      <header className="mb-1 flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-400">
          <MealIcon className="h-4 w-4" /> {label}
          {swapped && <span className="rounded-full bg-lemon-200 px-2 py-0.5 text-[10px] tracking-normal text-ink-800 normal-case">cambiado</span>}
        </p>
        <span className="text-xs text-ink-400">{totalTime} min</span>
      </header>

      <ul className="divide-y divide-sand-200">
        {dishes.map((d, i) => (
          <li key={`${d.id}-${i}`} className="flex items-center gap-2 py-2">
            <button type="button" onClick={() => onOpen(d, i)} className="flex min-w-0 flex-1 items-center gap-3 text-left active:opacity-70" aria-label={`Ver receta: ${d.title}`}>
              <DishArt recipe={d} size="sm" />
              <span className="min-w-0">
                {dishes.length > 1 && (
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-400">{DISH_TYPE_LABEL[d.dishType]}</span>
                )}
                <span className="block font-display text-[17px] font-bold leading-snug text-ink-900">{d.title}</span>
                <span className="block text-xs text-ink-400">
                  {d.prepTime + d.cookTime} min · 5 pers.
                </span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => onSwap(i)}
              title="Cambiar plato"
              aria-label={`Cambiar ${d.title}`}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-500 hover:bg-sand-100 active:bg-sand-200"
            >
              <ArrowLeftRight className="h-5 w-5" />
            </button>
            {dishes.length > 1 && (
              <button
                type="button"
                onClick={() => onRemove(i)}
                title="Quitar plato"
                aria-label={`Quitar ${d.title}`}
                className="-ml-1 flex h-11 w-9 shrink-0 items-center justify-center rounded-full text-ink-300 hover:bg-sand-100 hover:text-ink-700"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </li>
        ))}
      </ul>

      {canAdd && (
        <button
          type="button"
          onClick={onAdd}
          className={`mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold ${
            dishes.length === 1 ? 'bg-lemon-100 text-ink-800 hover:bg-lemon-200' : 'text-ink-400 hover:bg-sand-50'
          }`}
        >
          <Plus className="h-4 w-4" /> {dishes.length === 1 ? 'Añadir acompañamiento' : 'Añadir otro plato'}
        </button>
      )}
    </article>
  );
}
