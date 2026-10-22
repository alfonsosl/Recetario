import { createClient, type RealtimeChannel, type SupabaseClient } from '@supabase/supabase-js';
import type { Category, HouseholdState, NewItemInput, ShoppingItem, ShoppingList } from '../types';

/**
 * Servicio de sincronización de la lista de la compra común.
 *
 * - Si existen VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY → Supabase (Postgres + Realtime):
 *   todos los móviles con el mismo "Código de Hogar" ven los cambios al instante.
 * - Si no → localStorage + BroadcastChannel: funciona sin configuración y sincroniza
 *   en tiempo real entre pestañas/ventanas del mismo navegador.
 */

export type SyncMode = 'supabase' | 'local';

export interface ShoppingSync {
  readonly mode: SyncMode;
  subscribe(household: string, onState: (s: HouseholdState) => void, onError?: (e: Error) => void): () => void;
  createList(household: string, createdBy: string, name: string, items: NewItemInput[]): Promise<void>;
  addItems(household: string, listId: string, addedBy: string, items: NewItemInput[]): Promise<void>;
  toggleItem(household: string, itemId: string, checked: boolean, by: string): Promise<void>;
  removeItem(household: string, itemId: string): Promise<void>;
  archiveList(household: string, listId: string): Promise<void>;
  discardList(household: string, listId: string): Promise<void>;
}

const EMPTY: HouseholdState = { activeList: null, items: [], history: [] };
const HISTORY_LIMIT = 30;

export const uid = (): string =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : // Fallback para contextos no seguros (p. ej. http://192.168.x.x en la red local).
      'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      });

const now = () => new Date().toISOString();
const norm = (household: string) => household.trim().toUpperCase();

const buildItems = (listId: string, addedBy: string, items: NewItemInput[]): ShoppingItem[] =>
  items.map((i) => ({
    id: uid(),
    listId,
    name: i.name.trim(),
    quantity: i.quantity.trim(),
    category: i.category,
    checked: false,
    addedBy: i.source === 'menu' ? 'Menú semanal' : addedBy,
    source: i.source,
    createdAt: now(),
    checkedAt: null,
    checkedBy: null,
  }));

/* ====================================================================== */
/* Adaptador local: localStorage + BroadcastChannel                        */
/* ====================================================================== */

class LocalShoppingSync implements ShoppingSync {
  readonly mode = 'local' as const;
  private channel: BroadcastChannel | null =
    typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('med5-shopping') : null;
  private listeners = new Map<string, Set<(s: HouseholdState) => void>>();

  constructor() {
    this.channel?.addEventListener('message', (e: MessageEvent<{ household: string }>) => {
      this.emit(e.data.household);
    });
    // Respaldo para navegadores sin BroadcastChannel (el evento storage salta en las otras pestañas).
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key?.startsWith('med5:shopping:')) this.emit(e.key.replace('med5:shopping:', ''));
      });
    }
  }

  private key = (h: string) => `med5:shopping:${norm(h)}`;

  private read(household: string): HouseholdState {
    try {
      const raw = localStorage.getItem(this.key(household));
      return raw ? { ...EMPTY, ...(JSON.parse(raw) as HouseholdState) } : EMPTY;
    } catch {
      return EMPTY;
    }
  }

  private write(household: string, state: HouseholdState) {
    try {
      localStorage.setItem(this.key(household), JSON.stringify(state));
    } catch {
      /* almacenamiento lleno o bloqueado: el estado se mantiene en memoria hasta recargar */
    }
    this.emit(household, state);
    this.channel?.postMessage({ household: norm(household) });
  }

  private emit(household: string, state?: HouseholdState) {
    const h = norm(household);
    const s = state ?? this.read(h);
    this.listeners.get(h)?.forEach((cb) => cb(s));
  }

  private mutate(household: string, fn: (s: HouseholdState) => HouseholdState) {
    this.write(household, fn(this.read(household)));
  }

  subscribe(household: string, onState: (s: HouseholdState) => void) {
    const h = norm(household);
    if (!this.listeners.has(h)) this.listeners.set(h, new Set());
    this.listeners.get(h)!.add(onState);
    onState(this.read(h));
    return () => {
      this.listeners.get(h)?.delete(onState);
    };
  }

  async createList(household: string, createdBy: string, name: string, items: NewItemInput[]) {
    this.mutate(household, (s) => {
      if (s.activeList) return s; // ya hay una lista activa (otro usuario se adelantó)
      const list: ShoppingList = {
        id: uid(),
        household: norm(household),
        name,
        status: 'active',
        createdBy,
        createdAt: now(),
        completedAt: null,
        itemCount: 0,
      };
      return { ...s, activeList: list, items: buildItems(list.id, createdBy, items) };
    });
  }

  async addItems(household: string, listId: string, addedBy: string, items: NewItemInput[]) {
    this.mutate(household, (s) =>
      s.activeList?.id === listId ? { ...s, items: [...s.items, ...buildItems(listId, addedBy, items)] } : s,
    );
  }

  async toggleItem(household: string, itemId: string, checked: boolean, by: string) {
    this.mutate(household, (s) => ({
      ...s,
      items: s.items.map((i) =>
        i.id === itemId ? { ...i, checked, checkedAt: checked ? now() : null, checkedBy: checked ? by : null } : i,
      ),
    }));
  }

  async removeItem(household: string, itemId: string) {
    this.mutate(household, (s) => ({ ...s, items: s.items.filter((i) => i.id !== itemId) }));
  }

  async archiveList(household: string, listId: string) {
    this.mutate(household, (s) => {
      if (s.activeList?.id !== listId) return s; // idempotente: otro cliente ya la archivó
      const archived: ShoppingList = {
        ...s.activeList,
        status: 'archived',
        completedAt: now(),
        itemCount: s.items.length,
      };
      return { activeList: null, items: [], history: [archived, ...s.history].slice(0, HISTORY_LIMIT) };
    });
  }

  async discardList(household: string, listId: string) {
    this.mutate(household, (s) => (s.activeList?.id === listId ? { ...s, activeList: null, items: [] } : s));
  }
}

/* ====================================================================== */
/* Adaptador Supabase: Postgres + Realtime                                 */
/* ====================================================================== */

interface ListRow {
  id: string;
  household_code: string;
  name: string;
  status: 'active' | 'archived';
  created_by: string;
  created_at: string;
  completed_at: string | null;
  item_count: number;
}

interface ItemRow {
  id: string;
  list_id: string;
  household_code: string;
  name: string;
  quantity: string;
  category: Category;
  checked: boolean;
  added_by: string;
  source: 'menu' | 'manual';
  created_at: string;
  checked_at: string | null;
  checked_by: string | null;
}

const toList = (r: ListRow): ShoppingList => ({
  id: r.id,
  household: r.household_code,
  name: r.name,
  status: r.status,
  createdBy: r.created_by,
  createdAt: r.created_at,
  completedAt: r.completed_at,
  itemCount: r.item_count,
});

const toItem = (r: ItemRow): ShoppingItem => ({
  id: r.id,
  listId: r.list_id,
  name: r.name,
  quantity: r.quantity,
  category: r.category,
  checked: r.checked,
  addedBy: r.added_by,
  source: r.source,
  createdAt: r.created_at,
  checkedAt: r.checked_at,
  checkedBy: r.checked_by,
});

const fromItem = (i: ShoppingItem, household: string): ItemRow => ({
  id: i.id,
  list_id: i.listId,
  household_code: household,
  name: i.name,
  quantity: i.quantity,
  category: i.category,
  checked: i.checked,
  added_by: i.addedBy,
  source: i.source,
  created_at: i.createdAt,
  checked_at: i.checkedAt,
  checked_by: i.checkedBy,
});

class SupabaseShoppingSync implements ShoppingSync {
  readonly mode = 'supabase' as const;
  private db: SupabaseClient;
  /** Estado en memoria por hogar, para aplicar cambios optimistas sin esperar a la red. */
  private cache = new Map<string, HouseholdState>();
  private listeners = new Map<string, Set<(s: HouseholdState) => void>>();
  private refreshers = new Map<string, Set<() => void>>();

  constructor(url: string, anonKey: string) {
    this.db = createClient(url, anonKey, { auth: { persistSession: false } });
  }

  private emit(h: string, state: HouseholdState) {
    this.cache.set(h, state);
    this.listeners.get(h)?.forEach((cb) => cb(state));
  }

  /** Si una escritura falla, se descarta el cambio optimista recargando el estado real del servidor. */
  private async guard(household: string, fn: () => PromiseLike<{ error: unknown }>) {
    const res = await fn();
    if (res.error) {
      this.refreshers.get(norm(household))?.forEach((r) => r());
      throw res.error instanceof Error ? res.error : new Error((res.error as { message?: string }).message ?? 'Error de Supabase');
    }
  }

  private optimistic(household: string, fn: (s: HouseholdState) => HouseholdState) {
    const h = norm(household);
    this.emit(h, fn(this.cache.get(h) ?? EMPTY));
  }

  private async fetchState(h: string): Promise<HouseholdState> {
    const [active, history] = await Promise.all([
      this.db
        .from('shopping_lists')
        .select('*')
        .eq('household_code', h)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1),
      this.db
        .from('shopping_lists')
        .select('*')
        .eq('household_code', h)
        .eq('status', 'archived')
        .order('completed_at', { ascending: false })
        .limit(HISTORY_LIMIT),
    ]);
    if (active.error) throw active.error;
    if (history.error) throw history.error;
    const activeRow = (active.data as ListRow[])[0];
    let items: ShoppingItem[] = [];
    if (activeRow) {
      const res = await this.db.from('shopping_items').select('*').eq('list_id', activeRow.id);
      if (res.error) throw res.error;
      items = (res.data as ItemRow[]).map(toItem);
    }
    return {
      activeList: activeRow ? toList(activeRow) : null,
      items,
      history: (history.data as ListRow[]).map(toList),
    };
  }

  subscribe(household: string, onState: (s: HouseholdState) => void, onError?: (e: Error) => void) {
    const h = norm(household);
    if (!this.listeners.has(h)) this.listeners.set(h, new Set());
    this.listeners.get(h)!.add(onState);
    if (this.cache.has(h)) onState(this.cache.get(h)!);

    let timer: ReturnType<typeof setTimeout> | undefined;
    let disposed = false;
    const refresh = () => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        try {
          const state = await this.fetchState(h);
          if (!disposed) this.emit(h, state);
        } catch (e) {
          onError?.(e instanceof Error ? e : new Error(String(e)));
        }
      }, 120);
    };

    const filter = `household_code=eq.${h}`;
    const channel: RealtimeChannel = this.db
      .channel(`household:${h}:${uid()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shopping_lists', filter }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shopping_items', filter }, refresh)
      // Los DELETE no admiten filtro en Realtime: se escuchan sin filtro y se refresca el estado.
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'shopping_items' }, refresh)
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') refresh();
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') onError?.(new Error(`Realtime: ${status}`));
      });

    // Al volver a la app (móvil en segundo plano) se refresca por si se perdieron eventos.
    if (!this.refreshers.has(h)) this.refreshers.set(h, new Set());
    this.refreshers.get(h)!.add(refresh);
    const onVisible = () => document.visibilityState === 'visible' && refresh();
    document.addEventListener('visibilitychange', onVisible);
    refresh();

    return () => {
      disposed = true;
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisible);
      this.listeners.get(h)?.delete(onState);
      this.refreshers.get(h)?.delete(refresh);
      void this.db.removeChannel(channel);
    };
  }

  async createList(household: string, createdBy: string, name: string, items: NewItemInput[]) {
    const h = norm(household);
    const list: ShoppingList = {
      id: uid(),
      household: h,
      name,
      status: 'active',
      createdBy,
      createdAt: now(),
      completedAt: null,
      itemCount: 0,
    };
    const built = buildItems(list.id, createdBy, items);
    this.optimistic(h, (s) => (s.activeList ? s : { ...s, activeList: list, items: built }));
    await this.guard(h, () =>
      this.db.from('shopping_lists').insert({
        id: list.id,
        household_code: h,
        name,
        status: 'active',
        created_by: createdBy,
        created_at: list.createdAt,
        item_count: 0,
      }),
    );
    if (built.length) await this.guard(h, () => this.db.from('shopping_items').insert(built.map((i) => fromItem(i, h))));
  }

  async addItems(household: string, listId: string, addedBy: string, items: NewItemInput[]) {
    const h = norm(household);
    const built = buildItems(listId, addedBy, items);
    this.optimistic(h, (s) => ({ ...s, items: [...s.items, ...built] }));
    await this.guard(h, () => this.db.from('shopping_items').insert(built.map((i) => fromItem(i, h))));
  }

  async toggleItem(household: string, itemId: string, checked: boolean, by: string) {
    const patch = { checked, checkedAt: checked ? now() : null, checkedBy: checked ? by : null };
    this.optimistic(household, (s) => ({
      ...s,
      items: s.items.map((i) => (i.id === itemId ? { ...i, ...patch } : i)),
    }));
    await this.guard(household, () =>
      this.db.from('shopping_items').update({ checked, checked_at: patch.checkedAt, checked_by: patch.checkedBy }).eq('id', itemId),
    );
  }

  async removeItem(household: string, itemId: string) {
    this.optimistic(household, (s) => ({ ...s, items: s.items.filter((i) => i.id !== itemId) }));
    await this.guard(household, () => this.db.from('shopping_items').delete().eq('id', itemId));
  }

  async archiveList(household: string, listId: string) {
    const h = norm(household);
    const current = this.cache.get(h) ?? EMPTY;
    if (current.activeList?.id !== listId) return;
    const archived: ShoppingList = {
      ...current.activeList,
      status: 'archived',
      completedAt: now(),
      itemCount: current.items.length,
    };
    this.optimistic(h, (s) => ({ activeList: null, items: [], history: [archived, ...s.history] }));
    // Condición status = 'active' → idempotente si varios móviles archivan a la vez.
    await this.guard(h, () =>
      this.db
        .from('shopping_lists')
        .update({ status: 'archived', completed_at: archived.completedAt, item_count: archived.itemCount })
        .eq('id', listId)
        .eq('status', 'active'),
    );
  }

  async discardList(household: string, listId: string) {
    this.optimistic(household, (s) => (s.activeList?.id === listId ? { ...s, activeList: null, items: [] } : s));
    await this.guard(household, () => this.db.from('shopping_lists').delete().eq('id', listId));
  }
}

/* ====================================================================== */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const shoppingSync: ShoppingSync =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? new SupabaseShoppingSync(SUPABASE_URL, SUPABASE_ANON_KEY)
    : new LocalShoppingSync();
