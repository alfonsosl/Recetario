import { ArrowLeftRight, CalendarPlus, Check, Heart, Info, ListPlus, Pencil, Recycle, Refrigerator, Sun, UtensilsCrossed, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { CATEGORY_LABEL, DIFFICULTY_LABEL, DISH_TYPE_LABEL } from '../data';
import { useBackToClose } from '../hooks/useBackToClose';
import { recipeStore, useRecipes } from '../store/recipeStore';
import type { DayKey, MealType, Recipe, WeekNumber } from '../types';
import { DAYS } from '../utils/days';
import { capitalize, formatIngredient } from '../utils/format';
import { DishArt } from './DishArt';

interface Props {
  recipe: Recipe;
  onClose: () => void;
  onAddToList?: (recipe: Recipe) => void;
  onSwap?: () => void;
  onEdit?: (recipe: Recipe) => void;
  onAddToMenu?: (recipe: Recipe) => void;
  /** Dónde aparece la receta en el plan mensual. */
  usage?: { week: WeekNumber; day: DayKey; meal: MealType }[];
}

type InnerTab = 'ingredients' | 'steps';

interface WakeLockSentinelLike {
  release: () => Promise<void>;
}

const GROUP_LABEL = { legumbre: 'Legumbre', pescado: 'Pescado', carne: 'Carne', huevo: 'Huevo' } as const;

/** "Lentejas con verduras (sin carne)" → ["Lentejas con", "verduras (sin carne)"] para el título en dos líneas. */
function splitTitle(title: string): [string, string] {
  const words = title.split(' ');
  if (words.length < 3) return [title, ''];
  const half = Math.ceil(words.length / 2);
  return [words.slice(0, half).join(' '), words.slice(half).join(' ')];
}

/**
 * Ficha de receta con estética de libro de cocina: título grande, plato centrado,
 * banda amarilla de datos y columnas de ingredientes y preparación.
 * Pantalla completa en móvil (pestañas internas) y modal en escritorio.
 */
export function RecipeSheet({ recipe, onClose, onAddToList, onSwap, onEdit, onAddToMenu, usage = [] }: Props) {
  const [tab, setTab] = useState<InnerTab>('ingredients');
  const [haveIngredients, setHaveIngredients] = useState<Set<number>>(new Set());
  const [doneSteps, setDoneSteps] = useState<Set<number>>(new Set());
  const [wakeLock, setWakeLock] = useState<WakeLockSentinelLike | null>(null);
  const [added, setAdded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const requestClose = useBackToClose(onClose);
  const { favorites, editedIds } = useRecipes();
  const isFavorite = favorites.has(recipe.id);

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
  const [line1, line2] = splitTitle(recipe.title);

  const infoBand = (
    <div className="flex overflow-hidden rounded-md bg-lemon-100 text-ink-800">
      <div className="flex w-24 shrink-0 items-center bg-lemon-300 px-3 py-2 text-[11px] font-semibold leading-tight">Información del plato</div>
      <dl className="grid flex-1 grid-cols-4 divide-x divide-lemon-200 text-center">
        {(
          [
            ['5', 'Raciones'],
            [`${recipe.prepTime}′`, 'Prep.'],
            [`${recipe.cookTime}′`, 'Cocción'],
            [recipe.group ? GROUP_LABEL[recipe.group] : '—', 'Proteína'],
          ] as const
        ).map(([v, l]) => (
          <div key={l} className="px-1 py-2">
            <dt className="sr-only">{l}</dt>
            <dd className="font-display text-sm font-bold leading-tight">{v}</dd>
            <dd className="text-[10px] text-ink-500">{l}</dd>
          </div>
        ))}
      </dl>
    </div>
  );

  const ingredientsPanel = (
    <section aria-labelledby="ing-title">
      <h3 id="ing-title" className="mb-2 font-display text-sm font-bold text-ink-900">
        Ingredientes <span className="font-normal text-ink-400">· 5 personas</span>
      </h3>
      <ul className="divide-y divide-sand-200">
        {recipe.ingredients.map((ing, i) => {
          const have = haveIngredients.has(i);
          return (
            <li key={`${ing.name}-${i}`}>
              <button type="button" onClick={() => setHaveIngredients((s) => toggleIn(s, i))} className="flex min-h-12 w-full items-center gap-3 py-2 text-left" aria-pressed={have}>
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors ${have ? 'border-ink-800 bg-ink-800 text-white' : 'border-ink-300'}`}>
                  {have && <Check className="h-3 w-3" strokeWidth={3} />}
                </span>
                <span className={`flex-1 text-base leading-snug ${have ? 'text-ink-300 line-through' : 'text-ink-700'}`}>
                  {capitalize(ing.name)}
                  {(ing.optional || ing.fromRecipe) && (
                    <span className="mt-0.5 flex flex-wrap gap-1">
                      {ing.optional && <span className="rounded-full bg-sand-100 px-2 py-0.5 text-[11px] font-semibold text-ink-500">opcional</span>}
                      {ing.fromRecipe && (
                        <span className="rounded-full bg-lemon-100 px-2 py-0.5 text-[11px] font-semibold text-lemon-700">
                          sobras de {recipeStore.getById(ing.fromRecipe)?.title ?? ing.fromRecipe}
                        </span>
                      )}
                    </span>
                  )}
                </span>
                <span className={`shrink-0 text-right text-base font-semibold tabular-nums ${have ? 'text-ink-300' : 'text-ink-900'}`}>{formatIngredient(ing)}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );

  const stepsPanel = (
    <section aria-labelledby="steps-title">
      <h3 id="steps-title" className="mb-2 font-display text-sm font-bold text-ink-900">
        Preparación
      </h3>
      <ol className="space-y-2">
        {recipe.steps.map((step, i) => {
          const done = doneSteps.has(i);
          return (
            <li key={i}>
              <button
                type="button"
                onClick={() => setDoneSteps((s) => toggleIn(s, i))}
                aria-pressed={done}
                className={`flex w-full gap-3 rounded-xl p-3 text-left transition-colors ${done ? 'bg-sand-100' : 'bg-white'}`}
              >
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold ${done ? 'bg-ink-800 text-white' : 'bg-lemon-200 text-ink-900'}`}>
                  {done ? <Check className="h-4 w-4" strokeWidth={3} /> : i + 1}
                </span>
                <p className={`text-[17px] leading-relaxed md:text-[15px] ${done ? 'text-ink-400' : 'text-ink-700'}`}>{step}</p>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );

  const iconBtn = 'flex h-11 w-11 items-center justify-center rounded-full text-ink-600 hover:bg-sand-100 active:bg-sand-200';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6" role="dialog" aria-modal="true" aria-label={recipe.title}>
      <div className="animate-fade-in absolute inset-0 bg-ink-900/40" onClick={() => requestClose()} aria-hidden />
      <div
        ref={scrollRef}
        className="animate-sheet-up relative flex h-full w-full flex-col overflow-y-auto overscroll-contain bg-sand-50 md:h-auto md:max-h-[92vh] md:max-w-4xl md:rounded-[28px] md:shadow-2xl"
      >
        {/* Cabecera sticky */}
        <header className="pt-safe sticky top-0 z-10 bg-sand-50/95 backdrop-blur">
          <div className="flex items-center gap-1 px-2 py-2">
            <button type="button" onClick={() => requestClose()} className={`${iconBtn} h-12 w-12`} aria-label="Cerrar receta">
              <X className="h-7 w-7" />
            </button>
            <p className="min-w-0 flex-1 truncate text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-400">Mediterráneo 5 · Recetario</p>
            {hasWakeLock && (
              <button
                type="button"
                onClick={toggleWakeLock}
                aria-pressed={Boolean(wakeLock)}
                title="Mantener la pantalla encendida mientras cocinas"
                className={`${iconBtn} ${wakeLock ? 'bg-lemon-200 text-ink-900' : ''}`}
                aria-label="Mantener pantalla encendida"
              >
                <Sun className="h-5 w-5" />
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
                className={`min-h-11 rounded-full text-[15px] font-semibold transition-colors ${tab === key ? 'bg-ink-800 text-white' : 'bg-sand-100 text-ink-500'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </header>

        <div className="pb-safe flex-1 px-5 pb-6 md:px-10">
          {/* Página: título + plato */}
          <div className="pt-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-400">
              {CATEGORY_LABEL[recipe.category]} · {DISH_TYPE_LABEL[recipe.dishType]}
              {editedIds.has(recipe.id) && ' · editada'}
              {recipe.origin === 'propia' && ' · receta propia'}
              {recipe.origin === 'sugerencia' && ' · sugerencia'}
            </p>
            <h2 className="mt-1 font-display text-[2rem] font-bold leading-[1.05] tracking-tight text-ink-900 md:text-5xl">
              {line1}
              {line2 && (
                <>
                  <br />
                  {line2}
                </>
              )}
            </h2>
          </div>

          <div className="flex justify-center py-6">
            <DishArt recipe={recipe} size="lg" />
          </div>

          {/* Fila de iconos */}
          <div className="flex items-center justify-between border-b border-sand-200 pb-2">
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => recipeStore.toggleFavorite(recipe.id)}
                aria-pressed={isFavorite}
                aria-label={isFavorite ? 'Quitar de favoritas' : 'Marcar como favorita'}
                className={iconBtn}
              >
                <Heart className={`h-5 w-5 ${isFavorite ? 'fill-ink-900 text-ink-900' : ''}`} />
              </button>
              {onEdit && (
                <button type="button" onClick={() => requestClose(() => onEdit(recipe))} aria-label="Editar receta" title="Editar receta" className={iconBtn}>
                  <Pencil className="h-5 w-5" />
                </button>
              )}
              {onAddToMenu && (
                <button type="button" onClick={() => requestClose(() => onAddToMenu(recipe))} aria-label="Añadir al menú" title="Añadir al menú" className={iconBtn}>
                  <CalendarPlus className="h-5 w-5" />
                </button>
              )}
            </div>
            <div className="flex gap-1" aria-hidden>
              <span className="h-1.5 w-1.5 rounded-full bg-ink-800" />
              <span className="h-1.5 w-1.5 rounded-full bg-ink-200" />
              <span className="h-1.5 w-1.5 rounded-full bg-ink-200" />
            </div>
            <span className="flex h-11 w-11 items-center justify-center text-ink-400" aria-hidden>
              <UtensilsCrossed className="h-5 w-5" />
            </span>
          </div>

          <div className="mt-4 space-y-4">
            {infoBand}
            <p className="text-sm text-ink-500">
              {recipe.moments.map(capitalize).join(' y ')} · Dificultad {DIFFICULTY_LABEL[recipe.difficulty].toLowerCase()}
              {recipe.tags.length > 0 && <> · {recipe.tags.map((t) => `#${t}`).join(' ')}</>}
            </p>

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
                    className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-ink-800 px-4 font-semibold text-white hover:bg-ink-700 disabled:bg-ink-500"
                  >
                    {added ? <Check className="h-5 w-5" /> : <ListPlus className="h-5 w-5" />}
                    {added ? 'Añadido a la Lista Común' : 'Añadir ingredientes a la lista'}
                  </button>
                )}
                {onSwap && (
                  <button
                    type="button"
                    onClick={() => requestClose(onSwap)}
                    className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full border border-ink-200 bg-white px-4 font-semibold text-ink-700 hover:bg-sand-100"
                  >
                    <ArrowLeftRight className="h-5 w-5" /> Cambiar este plato
                  </button>
                )}
              </div>
            )}

            {/* Móvil: una pestaña cada vez. Escritorio: dos columnas como en una página. */}
            <div className="md:hidden">{tab === 'ingredients' ? ingredientsPanel : stepsPanel}</div>
            <div className="hidden gap-8 md:grid md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
              {ingredientsPanel}
              {stepsPanel}
            </div>

            {(recipe.notes || recipe.storage || recipe.generates.length > 0 || usage.length > 0) && (
              <section className="space-y-3 border-t border-sand-200 pt-4 text-[15px] text-ink-600">
                <h3 className="font-display text-sm font-bold text-ink-900">Notas</h3>
                {recipe.notes && (
                  <p className="flex gap-3">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" />
                    <span>{recipe.notes}</span>
                  </p>
                )}
                {recipe.storage && (
                  <p className="flex gap-3">
                    <Refrigerator className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" />
                    <span>
                      <strong className="font-semibold text-ink-900">Conservación: </strong>
                      {recipe.storage}
                    </span>
                  </p>
                )}
                {recipe.generates.length > 0 && (
                  <p className="flex gap-3">
                    <Recycle className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" />
                    <span>
                      <strong className="font-semibold text-ink-900">Reserva para otras recetas: </strong>
                      {recipe.generates.join(', ')}
                    </span>
                  </p>
                )}
                {usage.length > 0 && (
                  <div className="flex gap-3">
                    <CalendarPlus className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" />
                    <div>
                      <strong className="font-semibold text-ink-900">En el plan: </strong>
                      <span className="mt-1 flex flex-wrap gap-1.5">
                        {usage.map((u) => (
                          <span key={`${u.week}-${u.day}-${u.meal}`} className="rounded-full bg-sand-100 px-2.5 py-0.5 text-sm">
                            S{u.week} · {DAYS.find((d) => d.key === u.day)?.label} {u.meal}
                          </span>
                        ))}
                      </span>
                    </div>
                  </div>
                )}
              </section>
            )}

            {tab === 'ingredients' && (
              <button
                type="button"
                onClick={() => {
                  setTab('steps');
                  scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="min-h-12 w-full rounded-full bg-lemon-300 font-semibold text-ink-900 md:hidden"
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
