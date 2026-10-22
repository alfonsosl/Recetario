import { CalendarRange, ChevronLeft, ChevronRight, LayoutGrid, RotateCcw, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { MealCard } from '../components/MealCard';
import { useIsDesktop } from '../hooks/useMediaQuery';
import type { Planner } from '../hooks/usePlanner';
import type { DayKey, MealType, Recipe, WeekNumber } from '../types';
import { DAYS, MEALS, todayKey } from '../utils/days';

export interface Slot {
  week: WeekNumber;
  day: DayKey;
  meal: MealType;
}

interface Props {
  planner: Planner;
  onOpen: (recipe: Recipe, slot: Slot) => void;
  onSwap: (slot: Slot) => void;
}

const WEEKS: WeekNumber[] = [1, 2, 3, 4];

/** Fechas (día del mes) de la semana natural actual, de lunes a domingo. */
function currentWeekDates(): number[] {
  const d = new Date();
  const monday = new Date(d);
  monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return DAYS.map((_, i) => {
    const x = new Date(monday);
    x.setDate(monday.getDate() + i);
    return x.getDate();
  });
}

export function CalendarView({ planner, onOpen, onSwap }: Props) {
  const isDesktop = useIsDesktop();
  const [mode, setMode] = useState<'week' | 'month'>('week');
  const [day, setDay] = useState<DayKey>(todayKey());
  const dayStripRef = useRef<HTMLDivElement>(null);
  const { activeWeek, autoWeek, isoWeek, isManual } = planner;
  const isCurrentWeek = activeWeek === autoWeek;
  const today = todayKey();
  const dates = currentWeekDates();
  const dayIndex = DAYS.findIndex((d) => d.key === day);

  // Mantiene visible el día seleccionado en el selector horizontal.
  useEffect(() => {
    const el = dayStripRef.current?.querySelector<HTMLElement>('[aria-selected="true"]');
    el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [day, mode, isDesktop]);

  const moveDay = (delta: number) => setDay(DAYS[(dayIndex + delta + 7) % 7].key);

  return (
    <div className="space-y-4">
      {/* Cabecera de semana */}
      <section className="rounded-3xl bg-gradient-to-br from-olive-600 to-olive-800 p-4 text-white shadow-md md:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm text-olive-100">Menú activo para 5 personas</p>
            <h2 className="font-display text-2xl font-semibold md:text-3xl">Semana {activeWeek} de 4</h2>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-olive-100">
              <Sparkles className="h-4 w-4" />
              {isManual
                ? `Selección manual · la rotación indica Semana ${autoWeek}`
                : `Rotación automática · semana ISO ${isoWeek}`}
            </p>
          </div>
          <div className="grid shrink-0 grid-cols-2 rounded-full bg-white/15 p-1 sm:flex" role="group" aria-label="Tipo de vista">
            <button
              type="button"
              onClick={() => setMode('week')}
              aria-pressed={mode === 'week'}
              className={`flex h-10 items-center justify-center gap-1 rounded-full px-3 text-sm font-semibold ${mode === 'week' ? 'bg-white text-olive-800' : 'text-white'}`}
            >
              <LayoutGrid className="h-4 w-4" /> Semana
            </button>
            <button
              type="button"
              onClick={() => setMode('month')}
              aria-pressed={mode === 'month'}
              className={`flex h-10 items-center justify-center gap-1 rounded-full px-3 text-sm font-semibold ${mode === 'month' ? 'bg-white text-olive-800' : 'text-white'}`}
            >
              <CalendarRange className="h-4 w-4" /> Mes
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2" role="group" aria-label="Seleccionar semana">
          {WEEKS.map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => planner.setWeek(w)}
              aria-pressed={activeWeek === w}
              className={`relative min-h-12 rounded-xl text-sm font-semibold transition-colors ${
                activeWeek === w ? 'bg-white text-olive-800 shadow' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Semana {w}
              {w === autoWeek && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-terra-500" aria-label="semana actual" />}
            </button>
          ))}
        </div>

        {(isManual || planner.swappedCount > 0) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {isManual && (
              <button type="button" onClick={planner.followAuto} className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-white/15 px-3 text-sm font-medium hover:bg-white/25">
                <RotateCcw className="h-4 w-4" /> Volver a la semana actual
              </button>
            )}
            {planner.swappedCount > 0 && (
              <button
                type="button"
                onClick={() => planner.resetWeek(activeWeek)}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-white/15 px-3 text-sm font-medium hover:bg-white/25"
              >
                <RotateCcw className="h-4 w-4" /> Restaurar {planner.swappedCount} plato{planner.swappedCount > 1 ? 's' : ''} cambiado
                {planner.swappedCount > 1 ? 's' : ''}
              </button>
            )}
          </div>
        )}
      </section>

      {mode === 'week' && !isDesktop && (
        <>
          {/* Selector horizontal de días (móvil) */}
          <div ref={dayStripRef} className="scrollbar-none -mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1" role="tablist" aria-label="Día de la semana">
            {DAYS.map((d, i) => {
              const selected = d.key === day;
              const isToday = isCurrentWeek && d.key === today;
              return (
                <button
                  key={d.key}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-label={d.label}
                  onClick={() => setDay(d.key)}
                  className={`flex min-h-16 min-w-12 flex-1 snap-center flex-col items-center justify-center rounded-2xl border text-sm font-bold transition-colors ${
                    selected
                      ? 'border-terra-500 bg-terra-500 text-white shadow'
                      : isToday
                        ? 'border-terra-500 bg-white text-terra-600'
                        : 'border-sand-200 bg-white text-stone-600'
                  }`}
                >
                  <span className="text-lg leading-none">{d.short}</span>
                  {isCurrentWeek && <span className={`mt-1 text-xs font-medium ${selected ? 'text-terra-50' : 'text-stone-400'}`}>{dates[i]}</span>}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between">
            <button type="button" onClick={() => moveDay(-1)} className="flex h-12 w-12 items-center justify-center rounded-full hover:bg-sand-200" aria-label="Día anterior">
              <ChevronLeft className="h-6 w-6" />
            </button>
            <h3 className="font-display text-xl font-semibold text-olive-900">
              {DAYS[dayIndex].label}
              {isCurrentWeek && day === today && <span className="ml-2 rounded-full bg-terra-100 px-2 py-0.5 align-middle font-sans text-xs font-bold text-terra-700">HOY</span>}
            </h3>
            <button type="button" onClick={() => moveDay(1)} className="flex h-12 w-12 items-center justify-center rounded-full hover:bg-sand-200" aria-label="Día siguiente">
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-4">
            {MEALS.map((m) => {
              const slot = { week: activeWeek, day, meal: m.key };
              const recipe = planner.getRecipe(activeWeek, day, m.key);
              return (
                <MealCard
                  key={m.key}
                  recipe={recipe}
                  meal={m.key}
                  swapped={planner.isSwapped(activeWeek, day, m.key)}
                  onOpen={() => onOpen(recipe, slot)}
                  onSwap={() => onSwap(slot)}
                />
              );
            })}
          </div>
        </>
      )}

      {mode === 'week' && isDesktop && (
        <div className="grid grid-cols-7 gap-3">
          {DAYS.map((d, i) => {
            const isToday = isCurrentWeek && d.key === today;
            return (
              <div key={d.key} className="space-y-3">
                <div
                  className={`rounded-2xl px-2 py-2 text-center text-sm font-bold ${
                    isToday ? 'bg-terra-500 text-white' : 'bg-white text-stone-700 ring-1 ring-sand-200'
                  }`}
                >
                  {d.label}
                  {isCurrentWeek && <span className={`ml-1 font-medium ${isToday ? 'text-terra-50' : 'text-stone-400'}`}>{dates[i]}</span>}
                </div>
                {MEALS.map((m) => {
                  const slot = { week: activeWeek, day: d.key, meal: m.key };
                  const recipe = planner.getRecipe(activeWeek, d.key, m.key);
                  return (
                    <MealCard
                      key={m.key}
                      compact
                      recipe={recipe}
                      meal={m.key}
                      swapped={planner.isSwapped(activeWeek, d.key, m.key)}
                      onOpen={() => onOpen(recipe, slot)}
                      onSwap={() => onSwap(slot)}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {mode === 'month' && (
        <div className="space-y-4">
          <p className="text-sm text-stone-500">
            Ciclo mensual de 4 semanas. Se repite indefinidamente según la semana ISO del año.
          </p>
          {WEEKS.map((w) => (
            <section
              key={w}
              className={`overflow-hidden rounded-3xl border bg-white ${w === activeWeek ? 'border-olive-500 ring-2 ring-olive-200' : 'border-sand-200'}`}
            >
              <header className="flex items-center justify-between bg-sand-100 px-4 py-3">
                <h3 className="font-display text-lg font-semibold text-olive-900">
                  Semana {w}
                  {w === autoWeek && <span className="ml-2 rounded-full bg-terra-100 px-2 py-0.5 align-middle font-sans text-xs font-bold text-terra-700">ACTUAL</span>}
                </h3>
                {w !== activeWeek && (
                  <button type="button" onClick={() => planner.setWeek(w)} className="min-h-10 rounded-full px-3 text-sm font-semibold text-olive-700 hover:bg-olive-50">
                    Activar
                  </button>
                )}
              </header>
              <ul className="divide-y divide-sand-200 md:grid md:grid-cols-7 md:divide-x md:divide-y-0">
                {DAYS.map((d) => (
                  <li key={d.key} className="flex gap-3 px-4 py-3 md:flex-col md:gap-2 md:px-2">
                    <span className="w-8 shrink-0 pt-1 text-sm font-bold text-stone-400 md:w-auto md:pt-0 md:text-center">{d.short}</span>
                    <div className="grid min-w-0 flex-1 gap-1">
                      {MEALS.map((m) => {
                        const recipe = planner.getRecipe(w, d.key, m.key);
                        return (
                          <button
                            key={m.key}
                            type="button"
                            onClick={() => onOpen(recipe, { week: w, day: d.key, meal: m.key })}
                            className="flex min-h-11 items-start gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-sand-100"
                          >
                            <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${m.key === 'comida' ? 'bg-terra-500' : 'bg-sea-500'}`} aria-label={m.label} />
                            <span className="line-clamp-2 text-stone-700">{recipe.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
