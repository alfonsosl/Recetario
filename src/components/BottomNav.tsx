import { BookOpen, CalendarDays, ShoppingCart, type LucideIcon } from 'lucide-react';

export type Tab = 'calendar' | 'shopping' | 'recipes';

const TABS: { key: Tab; label: string; icon: LucideIcon }[] = [
  { key: 'calendar', label: 'Calendario', icon: CalendarDays },
  { key: 'shopping', label: 'Lista Común', icon: ShoppingCart },
  { key: 'recipes', label: 'Recetario', icon: BookOpen },
];

interface Props {
  tab: Tab;
  onChange: (t: Tab) => void;
  pendingCount: number;
  variant: 'bottom' | 'top';
}

function Badge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span
      className="absolute -right-3 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-terra-500 px-1 text-[11px] font-bold leading-none text-white ring-2 ring-white"
      aria-label={`${count} productos pendientes`}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}

/**
 * Navegación principal.
 * - bottom: barra inferior fija para móvil (áreas táctiles de 64 px).
 * - top: pestañas en la cabecera para escritorio.
 */
export function BottomNav({ tab, onChange, pendingCount, variant }: Props) {
  if (variant === 'top') {
    return (
      <nav aria-label="Navegación principal" className="hidden md:block">
        <ul className="flex gap-1">
          {TABS.map(({ key, label, icon: Icon }) => (
            <li key={key}>
              <button
                type="button"
                onClick={() => onChange(key)}
                aria-current={tab === key ? 'page' : undefined}
                className={`flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors ${
                  tab === key ? 'bg-olive-600 text-white' : 'text-stone-600 hover:bg-olive-50 hover:text-olive-700'
                }`}
              >
                <span className="relative">
                  <Icon className="h-5 w-5" aria-hidden />
                  {key === 'shopping' && <Badge count={pendingCount} />}
                </span>
                {label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    );
  }

  return (
    <nav aria-label="Navegación principal" className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-sand-200 bg-white/95 backdrop-blur md:hidden">
      <ul className="mx-auto grid max-w-lg grid-cols-3">
        {TABS.map(({ key, label, icon: Icon }) => {
          const active = tab === key;
          return (
            <li key={key}>
              <button
                type="button"
                onClick={() => onChange(key)}
                aria-current={active ? 'page' : undefined}
                className={`relative flex min-h-16 w-full flex-col items-center justify-center gap-1 px-2 text-xs font-semibold transition-colors ${
                  active ? 'text-olive-700' : 'text-stone-500'
                }`}
              >
                {active && <span className="absolute inset-x-8 top-0 h-1 rounded-b-full bg-olive-600" aria-hidden />}
                <span className={`relative flex h-8 w-14 items-center justify-center rounded-full transition-colors ${active ? 'bg-olive-100' : ''}`}>
                  <Icon className="h-6 w-6" strokeWidth={active ? 2.4 : 2} aria-hidden />
                  {key === 'shopping' && <Badge count={pendingCount} />}
                </span>
                <span>{label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
