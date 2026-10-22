import { ArrowLeftRight, Check, ChefHat, Clock, ListPlus, Sun, Users, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useBackToClose } from '../hooks/useBackToClose';
import type { Recipe } from '../types';
import { dayLabel } from '../utils/days';
import { formatIngredient } from '../utils/format';
import { RecipeImage } from './RecipeImage';

interface Props {
  recipe: Recipe;
  onClose: () => void;
  onAddToList?: (recipe: Recipe) => void;
  onSwap?: () => void;
}

type InnerTab = 'ingredients' | 'steps';

interface WakeLockSentinelLike {
  release: () => Promise<void>;
}

/**
 * Ficha de receta: pantalla completa tipo bottom sheet en móvil, modal centrado en escritorio.
 * Cabecera sticky con cierre al alcance del pulgar y pestañas internas en móvil.
 */
export function RecipeSheet({ recipe, onClose, onAddToList, onSwap }: Props) {
  const [tab, setTab] = useState<InnerTab>('ingredients');
  const [haveIngredients, setHaveIngredients] = useState<Set<number>>(new Set());
  const [doneSteps, setDoneSteps] = useState<Set<number>>(new Set());
  const [wakeLock, setWakeLock] = useState<WakeLockSentinelLike | null>(null);
  const [added, setAdded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const requestClose = useBackToClose(onClose);

  useEffect(() => () => void wakeLock?.release(), [wakeLock]);

  const toggleWakeLock = async () => {
    if (wakeLock) {
      await wakeLock.release();
      setWakeLock(null);
      return;
    }
    try {
      const nav = navigator as Navigator & { wakeLock?: { request: (t: 'screen') => Promise<WakeLockSentinelLike> } };
      if (nav.wakeLock) setWakeLock(await nav.wakeLock.request('screen'));
    } catch {
      /* no soportado o denegado */
    }
  };

  const toggleIn = (set: Set<number>, i: number) => {
    const next = new Set(set);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    return next;
  };

  const hasWakeLock = typeof navigator !== 'undefined' && 'wakeLock' in navigator;

  const ingredientsPanel = (
    <section aria-labelledby="ing-title">
      <h3 id="ing-title" className="mb-3 hidden font-display text-xl font-semibold text-olive-900 md:block">
        Ingredientes <span className="text-base font-normal text-stone-500">(5 personas)</span>
      </h3>
      <ul className="divide-y divide-sand-200 rounded-2xl border border-sand-200 bg-white">
        {recipe.ingredients.map((ing, i) => {
          const have = haveIngredients.has(i);
          return (
            <li key={`${ing.name}-${i}`}>
              <button
                type="button"
                onClick={() => setHaveIngredients((s) => toggleIn(s, i))}
                className="flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left"
                aria-pressed={have}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                    have ? 'border-olive-600 bg-olive-600 text-white' : 'border-sand-300'
                  }`}
                >
                  {have && <Check className="h-4 w-4" strokeWidth={3} />}
                </span>
                <span className={`flex-1 text-lg leading-snug ${have ? 'text-stone-400 line-through' : 'text-stone-800'}`}>
                  {ing.name}
                  {ing.note && <span className="block text-sm text-stone-500">{ing.note}</span>}
                </span>
                <span className={`shrink-0 text-right text-lg font-semibold tabular-nums ${have ? 'text-stone-400' : 'text-olive-700'}`}>
                  {formatIngredient(ing)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );

  const stepsPanel = (
    <section aria-labelledby="steps-title">
      <h3 id="steps-title" className="mb-3 hidden font-display text-xl font-semibold text-olive-900 md:block">
        Paso a paso
      </h3>
      <ol className="space-y-3">
        {recipe.steps.map((step, i) => {
          const done = doneSteps.has(i);
          return (
            <li key={i}>
              <button
                type="button"
                onClick={() => setDoneSteps((s) => toggleIn(s, i))}
                aria-pressed={done}
                className={`flex w-full gap-4 rounded-2xl border p-4 text-left transition-colors ${
                  done ? 'border-olive-200 bg-olive-50' : 'border-sand-200 bg-white'
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base font-bold ${
                    done ? 'bg-olive-600 text-white' : 'bg-terra-100 text-terra-700'
                  }`}
                >
                  {done ? <Check className="h-5 w-5" strokeWidth={3} /> : i + 1}
                </span>
                <p className={`text-lg leading-relaxed md:text-base ${done ? 'text-stone-500' : 'text-stone-800'}`}>{step}</p>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6" role="dialog" aria-modal="true" aria-label={recipe.title}>
      <div className="animate-fade-in absolute inset-0 bg-stone-900/50" onClick={() => requestClose()} aria-hidden />
      <div
        ref={scrollRef}
        className="animate-sheet-up relative flex h-full w-full flex-col overflow-y-auto overscroll-contain bg-sand-50 md:h-auto md:max-h-[90vh] md:max-w-4xl md:rounded-3xl md:shadow-2xl"
      >
        {/* Cabecera sticky */}
        <header className="pt-safe sticky top-0 z-10 border-b border-sand-200 bg-sand-50/95 backdrop-blur">
          <div className="flex items-center gap-2 px-2 py-2">
            <button
              type="button"
              onClick={() => requestClose()}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-stone-700 hover:bg-sand-200 active:bg-sand-300"
              aria-label="Cerrar receta"
            >
              <X className="h-7 w-7" />
            </button>
            <h2 className="min-w-0 flex-1 truncate font-display text-lg font-semibold text-olive-900">{recipe.title}</h2>
            {hasWakeLock && (
              <button
                type="button"
                onClick={toggleWakeLock}
                aria-pressed={Boolean(wakeLock)}
                title="Mantener la pantalla encendida mientras cocinas"
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                  wakeLock ? 'bg-terra-100 text-terra-700' : 'text-stone-500 hover:bg-sand-200'
                }`}
                aria-label="Mantener pantalla encendida"
              >
                <Sun className="h-6 w-6" />
              </button>
            )}
          </div>
          {/* Pestañas internas (solo móvil) */}
          <div className="grid grid-cols-2 gap-1 px-3 pb-2 md:hidden" role="tablist">
            {(
              [
                ['ingredients', 'Ingredientes (5 pers.)'],
                ['steps', 'Paso a Paso'],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={tab === key}
                onClick={() => {
                  setTab(key);
                  scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`min-h-12 rounded-xl text-base font-semibold transition-colors ${
                  tab === key ? 'bg-olive-600 text-white shadow' : 'bg-sand-100 text-stone-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </header>

        <div className="pb-safe flex-1">
          <RecipeImage src={recipe.image} alt={recipe.title} width={900} sizes="(min-width: 768px) 900px, 100vw" eager className="aspect-[16/9] w-full md:aspect-[21/8]" />

          <div className="space-y-4 p-4 md:p-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-terra-600">
                Semana {recipe.week} · {dayLabel(recipe.day)} · {recipe.meal === 'comida' ? 'Comida' : 'Cena'}
              </p>
              <h2 className="mt-1 font-display text-2xl font-semibold leading-tight text-olive-900 md:text-3xl">{recipe.title}</h2>
              <p className="mt-2 text-base text-stone-600">{recipe.description}</p>
            </div>

            <div className="flex flex-wrap gap-2 text-sm">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 font-medium text-stone-700 ring-1 ring-sand-200">
                <Users className="h-4 w-4 text-olive-600" /> 5 personas
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 font-medium text-stone-700 ring-1 ring-sand-200">
                <Clock className="h-4 w-4 text-olive-600" /> {recipe.prepTime + recipe.cookTime} min
                <span className="text-stone-400">({recipe.prepTime} prep.)</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 font-medium text-stone-700 ring-1 ring-sand-200">
                <ChefHat className="h-4 w-4 text-olive-600" /> {recipe.difficulty}
              </span>
            </div>

            {(onAddToList || onSwap) && (
              <div className="flex flex-col gap-2 sm:flex-row">
                {onAddToList && (
                  <button
                    type="button"
                    onClick={() => {
                      onAddToList(recipe);
                      setAdded(true);
                    }}
                    disabled={added}
                    className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-sea-600 px-4 font-semibold text-white hover:bg-sea-700 disabled:bg-olive-600"
                  >
                    {added ? <Check className="h-5 w-5" /> : <ListPlus className="h-5 w-5" />}
                    {added ? 'Añadido a la Lista Común' : 'Añadir ingredientes a la lista'}
                  </button>
                )}
                {onSwap && (
                  <button
                    type="button"
                    onClick={() => requestClose(onSwap)}
                    className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-sand-300 bg-white px-4 font-semibold text-stone-700 hover:bg-sand-100"
                  >
                    <ArrowLeftRight className="h-5 w-5" /> Cambiar este plato
                  </button>
                )}
              </div>
            )}

            {/* Móvil: una pestaña cada vez. Escritorio: dos columnas. */}
            <div className="md:hidden">{tab === 'ingredients' ? ingredientsPanel : stepsPanel}</div>
            <div className="hidden gap-6 md:grid md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
              {ingredientsPanel}
              {stepsPanel}
            </div>

            {tab === 'ingredients' && (
              <button
                type="button"
                onClick={() => {
                  setTab('steps');
                  scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="min-h-12 w-full rounded-xl bg-terra-500 font-semibold text-white md:hidden"
              >
                Empezar a cocinar →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
