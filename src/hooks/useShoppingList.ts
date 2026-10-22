import { useCallback, useEffect, useMemo, useState } from 'react';
import { shoppingSync } from '../services/shoppingSync';
import type { HouseholdState, NewItemInput } from '../types';

export type SyncStatus = 'connecting' | 'online' | 'error';

export function useShoppingList(household: string, userName: string) {
  const [state, setState] = useState<HouseholdState>({ activeList: null, items: [], history: [] });
  // Estado de conexión ligado al hogar: al cambiar de código vuelve a "connecting" automáticamente.
  const [conn, setConn] = useState<{ household: string; status: SyncStatus }>({ household: '', status: 'connecting' });
  const status: SyncStatus = conn.household === household ? conn.status : 'connecting';
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (household.trim().length < 3) return;
    return shoppingSync.subscribe(
      household,
      (s) => {
        setState(s);
        setConn({ household, status: 'online' });
      },
      (e) => {
        setConn({ household, status: 'error' });
        setError(e.message);
      },
    );
  }, [household]);

  const run = useCallback(async (fn: () => Promise<void>) => {
    try {
      await fn();
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error de sincronización');
    }
  }, []);

  const listId = state.activeList?.id;

  const actions = useMemo(
    () => ({
      createList: (name: string, items: NewItemInput[]) =>
        run(() => shoppingSync.createList(household, userName, name, items)),
      addItems: (items: NewItemInput[]) =>
        run(async () => {
          if (listId) return shoppingSync.addItems(household, listId, userName, items);
          // Sin lista activa: se crea automáticamente con estos productos.
          return shoppingSync.createList(household, userName, 'Lista de la compra', items);
        }),
      toggleItem: (id: string, checked: boolean) =>
        run(() => shoppingSync.toggleItem(household, id, checked, userName)),
      removeItem: (id: string) => run(() => shoppingSync.removeItem(household, id)),
      archiveList: () => run(async () => (listId ? shoppingSync.archiveList(household, listId) : undefined)),
      discardList: () => run(async () => (listId ? shoppingSync.discardList(household, listId) : undefined)),
    }),
    [household, userName, listId, run],
  );

  const total = state.items.length;
  const completed = state.items.filter((i) => i.checked).length;

  return {
    ...state,
    total,
    completed,
    pending: total - completed,
    status,
    error,
    clearError: () => setError(null),
    mode: shoppingSync.mode,
    ...actions,
  };
}

export type ShoppingApi = ReturnType<typeof useShoppingList>;
