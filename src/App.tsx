import { useCallback, useEffect, useRef, useState } from 'react';
import { BottomNav, type Tab } from './components/BottomNav';
import { RecipePicker } from './components/RecipePicker';
import { RecipeSheet } from './components/RecipeSheet';
import { Toast } from './components/Toast';
import { useIdentity } from './hooks/useIdentity';
import { useLocalStorage } from './hooks/useLocalStorage';
import { usePlanner } from './hooks/usePlanner';
import { useShoppingList } from './hooks/useShoppingList';
import { getDefaultSlot } from './data';
import type { Recipe } from './types';
import { aggregateIngredients } from './utils/aggregate';
import { CalendarView, type Slot } from './views/CalendarView';
import { RecipesView } from './views/RecipesView';
import { ShoppingView } from './views/ShoppingView';

export default function App() {
  const [tab, setTab] = useLocalStorage<Tab>('med5:tab', 'calendar');
  const planner = usePlanner();
  const identity = useIdentity();
  const shopping = useShoppingList(identity.household, identity.displayName);

  const [openRecipe, setOpenRecipe] = useState<{ recipe: Recipe; slot?: Slot } | null>(null);
  const [pickerSlot, setPickerSlot] = useState<Slot | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const showToast = useCallback((msg: string) => {
    clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  }, []);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  // Atajos del icono instalado (manifest.json → shortcuts): /?tab=shopping | recipes | calendar
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get('tab');
    if (requested === 'shopping' || requested === 'recipes' || requested === 'calendar') {
      setTab(requested);
      history.replaceState(history.state, '', window.location.pathname);
    }
  }, [setTab]);

  const changeTab = (t: Tab) => {
    setTab(t);
    window.scrollTo({ top: 0 });
  };

  const addRecipeToList = (recipe: Recipe) => {
    const items = aggregateIngredients([recipe]);
    void shopping.addItems(items);
    showToast(`${items.length} ingredientes añadidos a la Lista Común`);
  };

  return (
    <div className="min-h-dvh">
      <header className="pt-safe sticky top-0 z-30 border-b border-sand-200 bg-sand-50/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 md:h-16">
          <div className="flex items-center gap-2.5">
            <img src="/icons/icon-192.png" alt="" className="h-9 w-9 rounded-xl" width={36} height={36} />
            <div className="leading-tight">
              <h1 className="font-display text-lg font-semibold text-olive-900">Mediterráneo 5</h1>
              <p className="hidden text-xs text-stone-500 sm:block">Planificador Mensual y Lista Colaborativa</p>
            </div>
          </div>
          <BottomNav variant="top" tab={tab} onChange={changeTab} pendingCount={shopping.pending} />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-28 pt-4 md:pb-10">
        {tab === 'calendar' && (
          <CalendarView
            planner={planner}
            onOpen={(recipe, slot) => setOpenRecipe({ recipe, slot })}
            onSwap={(slot) => setPickerSlot(slot)}
          />
        )}
        {tab === 'shopping' && (
          <ShoppingView
            shopping={shopping}
            planner={planner}
            userName={identity.userName}
            onUserName={identity.setUserName}
            household={identity.household}
            onHousehold={identity.setHousehold}
            onToast={showToast}
          />
        )}
        {tab === 'recipes' && <RecipesView onOpen={(recipe) => setOpenRecipe({ recipe })} />}
      </main>

      <BottomNav variant="bottom" tab={tab} onChange={changeTab} pendingCount={shopping.pending} />

      {openRecipe && (
        <RecipeSheet
          key={openRecipe.recipe.id}
          recipe={openRecipe.recipe}
          onClose={() => setOpenRecipe(null)}
          onAddToList={addRecipeToList}
          onSwap={openRecipe.slot ? () => setPickerSlot(openRecipe.slot!) : undefined}
          usage={planner.usage.get(openRecipe.recipe.id)}
        />
      )}

      {pickerSlot && (
        <RecipePicker
          week={pickerSlot.week}
          day={pickerSlot.day}
          meal={pickerSlot.meal}
          currentId={planner.getSlot(pickerSlot.week, pickerSlot.day, pickerSlot.meal)[pickerSlot.index]?.id ?? ''}
          originalId={getDefaultSlot(pickerSlot.week, pickerSlot.day, pickerSlot.meal)[pickerSlot.index] ?? ''}
          onSelect={(id) => {
            planner.swapDish(pickerSlot.week, pickerSlot.day, pickerSlot.meal, pickerSlot.index, id);
            showToast('Plato cambiado en el calendario');
          }}
          onClose={() => setPickerSlot(null)}
        />
      )}

      <Toast message={toast} />
    </div>
  );
}
