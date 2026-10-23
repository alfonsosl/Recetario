import { Check, X } from 'lucide-react';
import { useState } from 'react';
import { useBackToClose } from '../hooks/useBackToClose';
import { MAX_DISHES, type Planner } from '../hooks/usePlanner';
import type { DayKey, MealType, Recipe, WeekNumber } from '../types';
import { DAYS, MEALS, todayKey } from '../utils/days';
import { DishArt } from './DishArt';

interface Props {
  recipe: Recipe;
  planner: Planner;
  onClose: () => void;
  onDone: (message: string) => void;
}

/** "Añadir al menú": elige semana, día, comida/cena y si sustituye un plato o se suma como acompañamiento. */
export function SlotChooser({ recipe, planner, onClose, onDone }: Props) {
  const requestClose = useBackToClose(onClose);
  const [week, setWeek] = useState<WeekNumber>(planner.activeWeek);
  const [day, setDay] = useState<DayKey>(todayKey());
  const [meal, setMeal] = useState<MealType>(recipe.moments[0] ?? 'comida');
  const dishes = planner.getSlot(week, day, meal);
  const canAdd = dishes.length < MAX_DISHES;
  // 'add' = añadir como plato adicional; número = sustituir ese plato
  const [target, setTarget] = useState<'add' | number>(canAdd ? 'add' : 0);
  const effectiveTarget = target === 'add' && !canAdd ? 0 : target;

  const confirm = () => {
    const dayLabel = DAYS.find((d) => d.key === day)?.label;
    if (effectiveTarget === 'add') {
      // Primeros y guarniciones van delante del plato principal.
      planner.addDish(week, day, meal, recipe.id, recipe.dishType !== 'principal');
      requestClose(() => onDone(`${recipe.title} añadido: S${week} · ${dayLabel} ${meal}`));
    } else {
      planner.swapDish(week, day, meal, effectiveTarget, recipe.id);
      requestClose(() => onDone(`${recipe.title} sustituye a ${dishes[effectiveTarget]?.title}`));
    }
  };

  const pill = (on: boolean) => `min-h-11 rounded-full px-3 text-sm font-semibold ${on ? 'bg-ink-800 text-white' : 'bg-white text-ink-600 ring-1 ring-sand-300'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6" role="dialog" aria-modal="true" aria-label="Añadir al menú">
      <div className="animate-fade-in absolute inset-0 bg-ink-900/40" onClick={() => requestClose()} aria-hidden />
      <div className="animate-sheet-up relative flex max-h-full w-full flex-col overflow-y-auto rounded-t-[28px] bg-sand-50 md:max-w-lg md:rounded-[28px] md:shadow-2xl">
        <header className="flex items-center gap-3 px-4 pb-2 pt-4">
          <DishArt recipe={recipe} size="xs" />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-400">Añadir al menú</p>
            <h2 className="truncate font-display text-lg font-bold text-ink-900">{recipe.title}</h2>
          </div>
          <button type="button" onClick={() => requestClose()} className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-sand-100" aria-label="Cerrar">
            <X className="h-6 w-6" />
          </button>
        </header>

        <div className="pb-safe space-y-4 px-4 pb-5">
          <div className="grid grid-cols-4 gap-2">
            {([1, 2, 3, 4] as const).map((w) => (
              <button key={w} type="button" onClick={() => setWeek(w)} className={pill(week === w)}>
                S{w}
                {w === planner.autoWeek && ' •'}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {DAYS.map((d) => (
              <button key={d.key} type="button" onClick={() => setDay(d.key)} aria-label={d.label} className={`${pill(day === d.key)} px-0`}>
                {d.short}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {MEALS.map((m) => (
              <button key={m.key} type="button" onClick={() => setMeal(m.key)} className={pill(meal === m.key)}>
                {m.label}
              </button>
            ))}
          </div>

          <fieldset className="space-y-2">
            <legend className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-400">¿Qué hacemos con esa {meal}?</legend>
            <button
              type="button"
              disabled={!canAdd}
              onClick={() => setTarget('add')}
              className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left disabled:opacity-40 ${effectiveTarget === 'add' ? 'border-ink-800 bg-white' : 'border-sand-200 bg-white/60'}`}
            >
              <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${effectiveTarget === 'add' ? 'border-ink-800 bg-ink-800 text-white' : 'border-ink-300'}`}>
                {effectiveTarget === 'add' && <Check className="h-3 w-3" strokeWidth={3} />}
              </span>
              <span>
                <span className="block font-semibold text-ink-900">Añadir como otro plato</span>
                <span className="block text-sm text-ink-500">{canAdd ? `Quedarán ${dishes.length + 1} platos` : `Máximo ${MAX_DISHES} platos`}</span>
              </span>
            </button>
            {dishes.map((d, i) => (
              <button
                key={`${d.id}-${i}`}
                type="button"
                onClick={() => setTarget(i)}
                className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left ${effectiveTarget === i ? 'border-ink-800 bg-white' : 'border-sand-200 bg-white/60'}`}
              >
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${effectiveTarget === i ? 'border-ink-800 bg-ink-800 text-white' : 'border-ink-300'}`}>
                  {effectiveTarget === i && <Check className="h-3 w-3" strokeWidth={3} />}
                </span>
                <DishArt recipe={d} size="xs" />
                <span className="min-w-0">
                  <span className="block text-sm text-ink-500">Sustituir a</span>
                  <span className="block truncate font-semibold text-ink-900">{d.title}</span>
                </span>
              </button>
            ))}
          </fieldset>

          <button type="button" onClick={confirm} className="min-h-12 w-full rounded-full bg-ink-800 font-semibold text-white hover:bg-ink-700">
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
