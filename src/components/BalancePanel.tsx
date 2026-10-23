import { CalendarPlus, CircleAlert, CircleCheck, CircleMinus, X } from 'lucide-react';
import { useBackToClose } from '../hooks/useBackToClose';
import type { Recipe, WeekNumber } from '../types';
import type { Evaluation } from '../utils/balance';
import type { Recommendation } from '../utils/recommend';
import { DishArt } from './DishArt';

interface Props {
  week: WeekNumber;
  current: Evaluation;
  original: Evaluation;
  recommendations: Recommendation[];
  onOpenRecipe: (recipe: Recipe) => void;
  onAddToMenu: (recipe: Recipe) => void;
  onClose: () => void;
}

const STATUS = {
  ok: { icon: CircleCheck, color: 'text-emerald-700', label: 'Cumple' },
  cerca: { icon: CircleMinus, color: 'text-lemon-700', label: 'Casi' },
  fuera: { icon: CircleAlert, color: 'text-red-700', label: 'Fuera' },
} as const;

export function ScoreRing({ score, size = 64 }: { score: number; size?: number }) {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`Equilibrio ${score} de 100`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-sand-200)" strokeWidth={6} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--color-ink-800)"
        strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray={`${(score / 100) * c} ${c}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="52%" dominantBaseline="middle" textAnchor="middle" className="font-display" fontWeight={700} fontSize={size * 0.3} fill="var(--color-ink-900)">
        {score}
      </text>
    </svg>
  );
}

/** Evaluación del equilibrio de la semana con tus cambios, comparada con el plan original. */
export function BalancePanel({ week, current, original, recommendations, onOpenRecipe, onAddToMenu, onClose }: Props) {
  const requestClose = useBackToClose(onClose);
  const delta = current.score - original.score;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6" role="dialog" aria-modal="true" aria-label="Equilibrio de la semana">
      <div className="animate-fade-in absolute inset-0 bg-ink-900/40" onClick={() => requestClose()} aria-hidden />
      <div className="animate-sheet-up relative flex h-full w-full flex-col overflow-y-auto overscroll-contain bg-sand-50 md:h-auto md:max-h-[92vh] md:max-w-2xl md:rounded-[28px] md:shadow-2xl">
        <header className="pt-safe sticky top-0 z-10 flex items-center gap-2 bg-sand-50/95 px-2 py-2 backdrop-blur">
          <button type="button" onClick={() => requestClose()} className="flex h-12 w-12 items-center justify-center rounded-full hover:bg-sand-100" aria-label="Cerrar">
            <X className="h-7 w-7" />
          </button>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-400">Semana {week} · Equilibrio</p>
        </header>

        <div className="pb-safe space-y-6 px-5 pb-8 md:px-8">
          <section className="flex items-center gap-5">
            <ScoreRing score={current.score} size={96} />
            <div>
              <h2 className="font-display text-3xl font-bold leading-tight text-ink-900">{current.level}</h2>
              <p className="mt-1 text-sm text-ink-500">
                Plan original del recetario: {original.score}/100
                {delta !== 0 && (
                  <span className={`ml-1 font-semibold ${delta > 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                    ({delta > 0 ? '+' : ''}
                    {delta} con tus cambios)
                  </span>
                )}
              </p>
            </div>
          </section>

          <section>
            <div className="flex overflow-hidden rounded-md bg-lemon-100">
              <div className="flex w-24 shrink-0 items-center bg-lemon-300 px-3 py-2 text-[11px] font-semibold leading-tight text-ink-800">Platos por semana</div>
              <dl className="grid flex-1 grid-cols-4 divide-x divide-lemon-200 text-center">
                {current.criteria.slice(0, 4).map((c) => (
                  <div key={c.key} className="px-1 py-2">
                    <dd className="font-display text-base font-bold text-ink-900">{c.value}</dd>
                    <dt className="text-[10px] text-ink-500">{c.label}</dt>
                  </div>
                ))}
              </dl>
            </div>
          </section>

          <section>
            <h3 className="mb-2 font-display text-sm font-bold text-ink-900">Criterios</h3>
            <ul className="divide-y divide-sand-200 rounded-2xl bg-white">
              {current.criteria.map((c) => {
                const s = STATUS[c.status];
                const Icon = s.icon;
                return (
                  <li key={c.key} className="flex items-start gap-3 p-3">
                    <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${s.color}`} aria-label={s.label} />
                    <div className="min-w-0 flex-1">
                      <p className="flex items-baseline justify-between gap-2">
                        <span className="font-semibold text-ink-900">{c.label}</span>
                        <span className="shrink-0 text-sm tabular-nums text-ink-500">
                          <strong className="text-ink-900">{c.value}</strong> · objetivo {c.target}
                        </span>
                      </p>
                      {c.advice && <p className="mt-0.5 text-sm text-ink-600">{c.advice}</p>}
                      <p className="mt-0.5 text-[11px] text-ink-400">{c.source === 'recetario' ? 'Criterio de tu recetario' : 'Criterio general orientativo'}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          {recommendations.length > 0 && (
            <section className="space-y-4">
              <h3 className="font-display text-sm font-bold text-ink-900">Propuestas para equilibrar</h3>
              {recommendations.map((rec) => (
                <div key={rec.reason}>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-400">{rec.reason}</p>
                  <ul className="space-y-2">
                    {rec.recipes.map((r) => (
                      <li key={r.id} className="flex items-center gap-3 rounded-2xl bg-white p-2">
                        <button type="button" onClick={() => onOpenRecipe(r)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                          <DishArt recipe={r} size="xs" />
                          <span className="min-w-0">
                            <span className="block truncate font-semibold text-ink-900">{r.title}</span>
                            <span className="block text-xs text-ink-400">{r.origin === 'sugerencia' ? 'Sugerencia nueva' : 'De tu recetario'} · {r.prepTime + r.cookTime} min</span>
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => requestClose(() => onAddToMenu(r))}
                          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-ink-800 px-3 text-sm font-semibold text-white"
                        >
                          <CalendarPlus className="h-4 w-4" /> Añadir
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          )}

          <p className="text-xs leading-relaxed text-ink-400">
            Cuenta cada plato según su proteína principal (como en tu recetario) y estima la verdura por ingredientes. Es una orientación para
            planificar, no un cálculo nutricional ni una pauta médica.
          </p>
        </div>
      </div>
    </div>
  );
}
