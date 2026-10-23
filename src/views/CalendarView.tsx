import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ScoreRing } from '../components/BalancePanel';
import { MealCard } from '../components/MealCard';
import { useIsDesktop } from '../hooks/useMediaQuery';
import type { Planner } from '../hooks/usePlanner';
import type { DayKey, MealType, Recipe, WeekNumber } from '../types';
import { DAYS, MEALS, todayKey } from '../utils/days';

export interface Slot {
  week: WeekNumber;
  day: DayKey;
  meal: MealType;
  /** Posición del plato dentro de la comida/cena (0 = primero de la lista). */
  index: number;
}

interface Props {
  planner: Planner;
  onOpen: (recipe: Recipe, slot: Slot) => void;
  onSwap: (slot: Slot) => void;
  onAdd: (slot: Omit<Slot, 'index'>) => void;
  onOpenBalance: () => void;
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

export function CalendarView({ planner, onOpen, onSwap, onAdd, onOpenBalance }: Props) {
  const isDesktop = useIsDesktop();
  const [mode, setMode] = useState<'week' | 'month'>('week');
  const [day, setDay] = useState<DayKey>(todayKey());
  const dayStripRef = useRef<HTMLDivElement>(null);
  const { activeWeek, autoWeek, isoWeek, isManual } = planner;
  const isCurrentWeek = activeWeek === autoWeek;
  const today = todayKey();
  const dates = currentWeekDates();
  const dayIndex = DAYS.findIndex((d) => d.key === day);
  const { current } = planner.evaluate(activeWeek);

  useEffect(() => {
    const el = dayStripRef.current?.querySelector<HTMLElement>('[aria-selected="true"]');
    el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [day, mode, isDesktop]);

  const moveDay = (delta: number) => setDay(DAYS[(dayIndex + delta + 7) % 7].key);

  const card = (d: DayKey, m: MealType, compact = false) => (
    <MealCard
      key={m}
      compact={compact}
      dishes={planner.getSlot(activeWeek, d, m)}
      meal={m}
      swapped={planner.isSwapped(activeWeek, d, m)}
      onOpen={(recipe, index) => onOpen(recipe, { week: activeWeek, day: d, meal: m, index })}
      onSwap={(index) => onSwap({ week: activeWeek, day: d, meal: m, index })}
      onRemove={(index) => planner.removeDish(activeWeek, d, m, index)}
      onAdd={() => onAdd({ week: activeWeek, day: d, meal: m })}
    />
  );

  return (
    <div className="space-y-5">
      {/* Portada de la semana */}
      <section>
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-400">5 personas · ISO {isoWeek}</p>
          <div className="flex shrink-0 rounded-full bg-white p-1 ring-1 ring-sand-200" role="group" aria-label="Tipo de vista">
            {(
              [
                ['week', 'Semana'],
                ['month', 'Mes'],
              ] as const
            ).map(([k, l]) => (
              <button
                key={k}
                type="button"
                onClick={() => setMode(k)}
                aria-pressed={mode === k}
                className={`h-9 rounded-full px-3 text-sm font-semibold ${mode === k ? 'bg-ink-800 text-white' : 'text-ink-500'}`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
        <h2 className="mt-1 font-display text-5xl font-bold leading-[0.95] tracking-tight text-ink-900 md:text-6xl">Semana {activeWeek}</h2>
        <p className="mt-1 font-display text-lg font-semibold text-ink-300">de 4 · {isManual ? 'elegida a mano' : 'rotación automática'}</p>

        <div className="mt-4 grid grid-cols-4 gap-2" role="group" aria-label="Seleccionar semana">
          {WEEKS.map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => planner.setWeek(w)}
              aria-pressed={activeWeek === w}
              className={`relative min-h-11 rounded-full text-sm font-semibold transition-colors ${
                activeWeek === w ? 'bg-ink-800 text-white' : 'bg-white text-ink-600 ring-1 ring-sand-200 hover:bg-sand-100'
              }`}
            >
              Semana {w}
              {w === autoWeek && <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-lemon-400" aria-label="semana actual" />}
            </button>
          ))}
        </div>

        {/* Banda de equilibrio (estilo "información nutricional") */}
        <button
          type="button"
          onClick={onOpenBalance}
          className="mt-3 flex w-full items-stretch overflow-hidden rounded-md bg-lemon-100 text-left text-ink-800 transition-colors hover:bg-lemon-200"
          aria-label={`Equilibrio de la semana: ${current.score} de 100, ${current.level}. Ver detalle`}
        >
          <span className="flex w-[5.5rem] shrink-0 flex-col justify-center bg-lemon-300 px-3 py-2">
            <span className="text-[11px] font-semibold leading-tight">Equilibrio</span>
            <span className="font-display text-2xl font-bold leading-none">
              {current.score}
              <span className="text-[11px] font-semibold text-ink-600">/100</span>
            </span>
          </span>
          <span className="grid flex-1 grid-cols-4 divide-x divide-lemon-200 text-center">
            {current.criteria.slice(0, 4).map((c) => (
              <span key={c.key} className="flex flex-col justify-center px-1 py-2">
                <span className={`font-display text-base font-bold ${c.status === 'ok' ? 'text-ink-900' : 'text-red-700'}`}>{c.value}</span>
                <span className="truncate text-[10px] text-ink-500">{c.label}</span>
              </span>
            ))}
          </span>
        </button>

        {(isManual || planner.swappedCount > 0) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {isManual && (
              <button type="button" onClick={planner.followAuto} className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-ink-600 ring-1 ring-sand-300 hover:bg-white">
                <RotateCcw className="h-4 w-4" /> Volver a la semana actual
              </button>
            )}
            {planner.swappedCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`¿Restaurar el menú original de la Semana ${activeWeek}?`)) planner.resetWeek(activeWeek);
                }}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-ink-600 ring-1 ring-sand-300 hover:bg-white"
              >
                <RotateCcw className="h-4 w-4" /> Restaurar menú original de la semana
              </button>
            )}
          </div>
        )}
      </section>

      {mode === 'week' && !isDesktop && (
        <>
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
                  className={`relative flex min-h-16 min-w-12 flex-1 snap-center flex-col items-center justify-center rounded-full font-display text-sm font-bold transition-colors ${
                    selected ? 'bg-ink-800 text-white' : 'bg-white text-ink-700 ring-1 ring-sand-200'
                  }`}
                >
                  <span className="text-lg leading-none">{d.short}</span>
                  {isCurrentWeek && <span className={`mt-1 font-sans text-[11px] font-medium ${selected ? 'text-ink-200' : 'text-ink-400'}`}>{dates[i]}</span>}
                  {isToday && <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-lemon-400" aria-label="hoy" />}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between">
            <button type="button" onClick={() => moveDay(-1)} className="flex h-12 w-12 items-center justify-center rounded-full hover:bg-white" aria-label="Día anterior">
              <ChevronLeft className="h-6 w-6" />
            </button>
            <h3 className="font-display text-2xl font-bold text-ink-900">
              {DAYS[dayIndex].label}
              {isCurrentWeek && day === today && <span className="ml-2 rounded-full bg-lemon-300 px-2 py-0.5 align-middle font-sans text-[11px] font-bold text-ink-900">HOY</span>}
            </h3>
            <button type="button" onClick={() => moveDay(1)} className="flex h-12 w-12 items-center justify-center rounded-full hover:bg-white" aria-label="Día siguiente">
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-4">{MEALS.map((m) => card(day, m.key))}</div>
        </>
      )}

      {mode === 'week' && isDesktop && (
        <div className="grid grid-cols-7 gap-3">
          {DAYS.map((d, i) => {
            const isToday = isCurrentWeek && d.key === today;
            return (
              <div key={d.key} className="space-y-2">
                <div className={`rounded-full px-2 py-1.5 text-center font-display text-sm font-bold ${isToday ? 'bg-ink-800 text-white' : 'text-ink-700'}`}>
                  {d.label}
                  {isCurrentWeek && <span className={`ml-1 font-sans font-medium ${isToday ? 'text-ink-200' : 'text-ink-400'}`}>{dates[i]}</span>}
                </div>
                {MEALS.map((m) => card(d.key, m.key, true))}
              </div>
            );
          })}
        </div>
      )}

      {mode === 'month' && (
        <div className="space-y-4">
          <p className="text-sm text-ink-500">Ciclo de 4 semanas que se repite según la semana ISO del año.</p>
          {WEEKS.map((w) => {
            const ev = planner.evaluate(w).current;
            return (
              <section key={w} className={`overflow-hidden rounded-[24px] bg-white ${w === activeWeek ? 'ring-2 ring-ink-800' : 'ring-1 ring-sand-200'}`}>
                <header className="flex items-center justify-between px-4 py-3">
                  <h3 className="font-display text-xl font-bold text-ink-900">
                    Semana {w}
                    {w === autoWeek && <span className="ml-2 rounded-full bg-lemon-300 px-2 py-0.5 align-middle font-sans text-[11px] font-bold">ACTUAL</span>}
                  </h3>
                  <span className="flex items-center gap-2">
                    <span className="hidden text-xs text-ink-400 sm:inline">{ev.level}</span>
                    <ScoreRing score={ev.score} size={36} />
                    {w !== activeWeek && (
                      <button type="button" onClick={() => planner.setWeek(w)} className="min-h-9 rounded-full px-3 text-sm font-semibold text-ink-700 ring-1 ring-sand-300 hover:bg-sand-50">
                        Ver
                      </button>
                    )}
                  </span>
                </header>
                <ul className="divide-y divide-sand-200 border-t border-sand-200 md:grid md:grid-cols-7 md:divide-x md:divide-y-0">
                  {DAYS.map((d) => (
                    <li key={d.key} className="flex gap-3 px-4 py-3 md:flex-col md:gap-2 md:px-2">
                      <span className="w-6 shrink-0 pt-1 font-display text-sm font-bold text-ink-300 md:w-auto md:pt-0 md:text-center">{d.short}</span>
                      <div className="grid min-w-0 flex-1 gap-2">
                        {MEALS.map((m) => (
                          <div key={m.key} className="min-w-0">
                            <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-ink-300">{m.label}</span>
                            {planner.getSlot(w, d.key, m.key).map((recipe, index) => (
                              <button
                                key={`${recipe.id}-${index}`}
                                type="button"
                                onClick={() => onOpen(recipe, { week: w, day: d.key, meal: m.key, index })}
                                className="flex min-h-9 w-full items-center gap-1.5 rounded-lg px-1 py-0.5 text-left text-sm text-ink-700 hover:bg-sand-50"
                              >
                                <span className="text-base" aria-hidden>
                                  {recipe.emoji}
                                </span>
                                <span className="line-clamp-2">{recipe.title}</span>
                              </button>
                            ))}
                          </div>
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
