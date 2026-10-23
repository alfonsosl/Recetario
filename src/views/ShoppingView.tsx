import { CalendarDays, ChevronDown, FilePlus2, History, ListPlus, ShoppingBasket, TriangleAlert, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CompletionOverlay } from '../components/shopping/CompletionOverlay';
import { IdentityBar } from '../components/shopping/IdentityBar';
import { QuickAddBar } from '../components/shopping/QuickAddBar';
import { ShoppingItemRow } from '../components/shopping/ShoppingItemRow';
import type { Planner } from '../hooks/usePlanner';
import type { ShoppingApi } from '../hooks/useShoppingList';
import { CATEGORIES, type ShoppingItem, type WeekNumber } from '../types';
import { aggregateIngredients } from '../utils/aggregate';
import { CATEGORY_META, normalizeCategory } from '../utils/categories';
import { formatDateTime } from '../utils/format';

interface Props {
  shopping: ShoppingApi;
  planner: Planner;
  userName: string;
  onUserName: (n: string) => void;
  household: string;
  onHousehold: (c: string) => void;
  onToast: (msg: string) => void;
}

const COUNTDOWN_SECONDS = 2;
const SETTLE_MS = 650;

export function ShoppingView({ shopping, planner, userName, onUserName, household, onHousehold, onToast }: Props) {
  const [creating, setCreating] = useState(false);
  const [importWeek, setImportWeek] = useState<WeekNumber>(planner.activeWeek);
  const [settling, setSettling] = useState<Set<string>>(new Set());
  const [tick, setTick] = useState<{ listId: string; remaining: number } | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const { activeList, items, total, completed } = shopping;
  const listId = activeList?.id;
  const percent = total ? Math.round((completed / total) * 100) : 0;

  /* ---------- REGLA DE AUTOCOMPLETADO ---------- */
  const allDone = total > 0 && completed === total;
  const latest = useRef({ archive: shopping.archiveList, onToast, total });
  useEffect(() => {
    latest.current = { archive: shopping.archiveList, onToast, total };
  });

  useEffect(() => {
    if (!allDone || !listId) return;
    let remaining = COUNTDOWN_SECONDS;
    const timer = setInterval(() => {
      remaining -= 1;
      if (remaining > 0) {
        setTick({ listId, remaining });
        return;
      }
      clearInterval(timer);
      const { archive, onToast: toast, total: count } = latest.current;
      setCreating(false);
      void archive();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      toast(`Lista archivada en el historial (${count} productos)`);
    }, 1000);
    // Si alguien desmarca un producto durante la cuenta atrás, se cancela el archivado.
    return () => {
      clearInterval(timer);
      setTick(null);
    };
  }, [allDone, listId]);

  const countdown = allDone && listId ? (tick?.listId === listId ? tick.remaining : COUNTDOWN_SECONDS) : null;

  /* ---------- Marcado con animación antes de bajar al final ---------- */
  const toggle = (item: ShoppingItem) => {
    const next = !item.checked;
    if (next) {
      setSettling((s) => new Set(s).add(item.id));
      setTimeout(() => {
        setSettling((s) => {
          const n = new Set(s);
          n.delete(item.id);
          return n;
        });
      }, SETTLE_MS);
    }
    void shopping.toggleItem(item.id, next);
  };

  const groups = useMemo(() => {
    const sinks = (i: ShoppingItem) => i.checked && !settling.has(i.id);
    return CATEGORIES.map((category) => {
      const list = items
        .filter((i) => normalizeCategory(i.category) === category)
        .sort((a, b) => {
          const sa = sinks(a);
          const sb = sinks(b);
          if (sa !== sb) return sa ? 1 : -1;
          if (sa && sb) return (a.checkedAt ?? '').localeCompare(b.checkedAt ?? '');
          return a.createdAt.localeCompare(b.createdAt);
        });
      return { category, list, done: list.filter((i) => i.checked).length };
    }).filter((g) => g.list.length > 0);
  }, [items, settling]);

  const importDishes = planner.weekRecipes(importWeek);
  const importPreview = useMemo(() => aggregateIngredients(importDishes), [importDishes]);
  const pantryCount = importPreview.filter((p) => p.category === 'Especias').length;

  const createFromMenu = async () => {
    await shopping.createList(`Menú Semana ${importWeek}`, importPreview);
    setCreating(false);
    onToast(`${importPreview.length} productos importados de la Semana ${importWeek}`);
  };

  const createEmpty = async () => {
    await shopping.createList('Lista común', []);
    setCreating(false);
  };

  return (
    <div className={`space-y-4 ${activeList ? 'pb-36 md:pb-4' : ''}`}>
      <IdentityBar
        userName={userName}
        onUserName={onUserName}
        household={household}
        onHousehold={onHousehold}
        mode={shopping.mode}
        status={shopping.status}
      />

      {shopping.error && (
        <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span className="flex-1">No se pudo sincronizar: {shopping.error}</span>
          <button type="button" onClick={shopping.clearError} className="-m-1 p-1" aria-label="Cerrar aviso">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ---------- Sin lista activa ---------- */}
      {!activeList && !creating && (
        <section className="rounded-3xl border border-sand-200 bg-white p-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-olive-50">
            <ShoppingBasket className="h-8 w-8 text-olive-600" />
          </div>
          <h2 className="mt-3 font-display text-xl font-semibold text-olive-900">No hay ninguna lista activa</h2>
          <p className="mt-1 text-sm text-stone-500">Crea una lista común: todos los que usen el código {household} la verán.</p>
          <button
            type="button"
            onClick={() => {
              setImportWeek(planner.activeWeek);
              setCreating(true);
            }}
            className="mt-5 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-terra-500 px-6 text-lg font-semibold text-white shadow-md transition-colors hover:bg-terra-600 sm:w-auto"
          >
            <ListPlus className="h-6 w-6" /> Crear Nueva Lista de la Compra
          </button>
        </section>
      )}

      {!activeList && creating && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-olive-900">Nueva lista de la compra</h2>
            <button type="button" onClick={() => setCreating(false)} className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-sand-200" aria-label="Cancelar">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="rounded-3xl border-2 border-olive-500 bg-white p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-olive-100 text-olive-700">
                <CalendarDays className="h-6 w-6" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-olive-600">Opción A · Recomendada</p>
                <h3 className="font-semibold text-stone-900">Importar ingredientes del menú semanal</h3>
                <p className="text-sm text-stone-500">Suma las cantidades de los {importDishes.length} platos de la semana (5 personas), redondeadas para comprar. No incluye opcionales ni sobras de otras recetas; las {pantryCount} especias aparecen como "revisar". Después puedes añadir extras.</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2" role="group" aria-label="Semana a importar">
              {([1, 2, 3, 4] as const).map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setImportWeek(w)}
                  aria-pressed={importWeek === w}
                  className={`min-h-11 rounded-xl text-sm font-semibold ${importWeek === w ? 'bg-olive-600 text-white' : 'bg-sand-100 text-stone-700'}`}
                >
                  S{w}
                  {w === planner.activeWeek && ' ★'}
                </button>
              ))}
            </div>
            <details className="mt-3 rounded-xl bg-sand-50 p-3 text-sm">
              <summary className="cursor-pointer font-medium text-stone-700">Ver los {importPreview.length} productos</summary>
              <ul className="mt-2 max-h-56 space-y-1 overflow-y-auto">
                {importPreview.map((p) => (
                  <li key={p.name} className="flex justify-between gap-3 text-stone-600">
                    <span>
                      {CATEGORY_META[p.category].emoji} {p.name}
                    </span>
                    <span className="shrink-0 font-medium tabular-nums">{p.quantity}</span>
                  </li>
                ))}
              </ul>
            </details>
            <button
              type="button"
              onClick={createFromMenu}
              className="mt-3 min-h-12 w-full rounded-xl bg-olive-600 font-semibold text-white hover:bg-olive-700"
            >
              Generar lista de la Semana {importWeek}
            </button>
          </div>

          <button
            type="button"
            onClick={createEmpty}
            className="flex w-full items-start gap-3 rounded-3xl border border-sand-200 bg-white p-4 text-left hover:bg-sand-100"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sea-50 text-sea-600">
              <FilePlus2 className="h-6 w-6" />
            </span>
            <span>
              <span className="block text-xs font-bold uppercase tracking-wide text-sea-600">Opción B</span>
              <span className="block font-semibold text-stone-900">Crear lista común desde cero</span>
              <span className="block text-sm text-stone-500">Lista vacía para que cada uno añada lo que necesite.</span>
            </span>
          </button>
        </section>
      )}

      {/* ---------- Lista activa ---------- */}
      {activeList && (
        <>
          <div className="sticky top-[calc(var(--safe-area-inset-top,env(safe-area-inset-top))+3.5rem)] z-20 -mx-4 bg-sand-50/95 px-4 py-2 backdrop-blur md:top-16">
            <div className="rounded-2xl border border-sand-200 bg-white p-3 shadow-sm">
              <div className="flex items-baseline justify-between gap-2">
                <p className="min-w-0 truncate text-sm font-semibold text-stone-800">
                  {activeList.name} <span className="font-normal text-stone-500">· por {activeList.createdBy}</span>
                </p>
                <p className="shrink-0 font-display text-lg font-bold tabular-nums text-olive-700">{percent}%</p>
              </div>
              <div
                className="mt-2 h-3 overflow-hidden rounded-full bg-sand-200"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percent}
                aria-label="Progreso de la compra"
              >
                <div className="h-full rounded-full bg-gradient-to-r from-olive-500 to-olive-600 transition-[width] duration-500" style={{ width: `${percent}%` }} />
              </div>
              <p className="mt-1.5 text-sm font-medium tabular-nums text-stone-600" aria-live="polite">
                {completed} de {total} productos comprados - {percent}%
              </p>
            </div>
          </div>

          {total === 0 && (
            <div className="rounded-3xl border border-dashed border-sand-300 p-8 text-center text-stone-500">
              La lista está vacía. Añade el primer producto con la barra inferior.
            </div>
          )}

          {groups.map(({ category, list, done }) => (
            <section key={category} className="overflow-hidden rounded-3xl border border-sand-200 bg-white">
              <header className={`flex items-center justify-between px-4 py-2.5 ${CATEGORY_META[category].tone}`}>
                <h3 className="text-sm font-bold">
                  <span aria-hidden>{CATEGORY_META[category].emoji}</span> {category}
                </h3>
                <span className="text-xs font-semibold tabular-nums opacity-80">
                  {done}/{list.length}
                </span>
              </header>
              <ul className="divide-y divide-sand-200">
                {list.map((item) => (
                  <ShoppingItemRow
                    key={item.id}
                    item={item}
                    checked={item.checked}
                    onToggle={() => toggle(item)}
                    onRemove={() => void shopping.removeItem(item.id)}
                  />
                ))}
              </ul>
            </section>
          ))}

          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('¿Descartar la lista activa para todos los miembros del hogar? No se guardará en el historial.')) {
                  void shopping.discardList();
                }
              }}
              className="min-h-11 rounded-full px-4 text-sm font-medium text-stone-500 hover:bg-sand-200 hover:text-red-600"
            >
              Descartar lista
            </button>
          </div>

          <QuickAddBar onAdd={(item) => void shopping.addItems([item])} />
        </>
      )}

      {/* ---------- Historial ---------- */}
      {shopping.history.length > 0 && (
        <section className="rounded-3xl border border-sand-200 bg-white">
          <button
            type="button"
            onClick={() => setShowHistory((v) => !v)}
            aria-expanded={showHistory}
            className="flex min-h-14 w-full items-center gap-2 px-4 text-left"
          >
            <History className="h-5 w-5 text-stone-500" />
            <span className="flex-1 font-semibold text-stone-800">Historial de Listas Completadas</span>
            <span className="rounded-full bg-sand-100 px-2 py-0.5 text-xs font-bold text-stone-600">{shopping.history.length}</span>
            <ChevronDown className={`h-5 w-5 text-stone-400 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
          </button>
          {showHistory && (
            <ul className="divide-y divide-sand-200 border-t border-sand-200">
              {shopping.history.map((l) => (
                <li key={l.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-stone-800">{l.name}</p>
                    <p className="text-xs text-stone-500">
                      {l.completedAt ? formatDateTime(l.completedAt) : '—'} · creada por {l.createdBy}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-olive-50 px-2.5 py-1 text-xs font-bold text-olive-700">{l.itemCount} productos</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {countdown !== null && (
        <CompletionOverlay
          seconds={countdown}
          itemCount={total}
          onUndo={() => {
            // Desmarca el último producto marcado: la regla deja de cumplirse y se cancela el archivado.
            const last = [...items].filter((i) => i.checked).sort((a, b) => (b.checkedAt ?? '').localeCompare(a.checkedAt ?? ''))[0];
            if (last) void shopping.toggleItem(last.id, false);
          }}
        />
      )}
    </div>
  );
}
