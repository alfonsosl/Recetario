import { useCallback, useEffect, useRef, useState } from 'react';
import { BottomNav, type Tab } from './components/BottomNav';
import { BalancePanel } from './components/BalancePanel';
import { RecipeEditor } from './components/RecipeEditor';
import { RecipePicker } from './components/RecipePicker';
import { RecipeSheet } from './components/RecipeSheet';
import { SlotChooser } from './components/SlotChooser';
import { Toast } from './components/Toast';
import { useIdentity } from './hooks/useIdentity';
import { useLocalStorage } from './hooks/useLocalStorage';
import { usePlanner } from './hooks/usePlanner';
import { useShoppingList } from './hooks/useShoppingList';
import { getDefaultSlot } from './data';
import { recipeStore, useRecipes } from './store/recipeStore';
import type { NutritionGroup, Recipe } from './types';
import { aggregateIngredients } from './utils/aggregate';
import { recommendForBalance } from './utils/recommend';
import { CalendarView, type Slot } from './views/CalendarView';
import { RecipesView } from './views/RecipesView';
import { ShoppingView } from './views/ShoppingView';

export default function App() {
  const [tab, setTab] = useLocalStorage<Tab>('med5:tab', 'calendar');
  const planner = usePlanner();
  const identity = useIdentity();
  const shopping = useShoppingList(identity.household, identity.displayName);

  const recipes = useRecipes();
  const [openRecipe, setOpenRecipe] = useState<{ recipe: Recipe; slot?: Slot } | null>(null);
  const [picker, setPicker] = useState<{ mode: 'swap' | 'add'; slot: Slot } | null>(null);
  const [editing, setEditing] = useState<{ recipe: Recipe | null } | null>(null);
  const [placing, setPlacing] = useState<Recipe | null>(null);
  const [balanceOpen, setBalanceOpen] = useState(false);
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

  // Equilibrio de la semana activa: qué le falta (para priorizar sugerencias y propuestas).
  const evaluation = planner.evaluate(planner.activeWeek);
  const needs = {
    groups: evaluation.current.criteria
      .filter((c) => c.value < c.min && ['legumbre', 'pescado', 'carne', 'huevo'].includes(c.key))
      .map((c) => c.key as NutritionGroup),
    vegetables: evaluation.current.criteria.some((c) => c.key === 'verdura' && c.value < c.min),
  };
  const weekIds = new Set(planner.weekRecipes(planner.activeWeek).map((r) => r.id));
  const recommendations = recommendForBalance(evaluation.current, weekIds, recipes.pendingSuggestions, recipes.all);

  // La ficha muestra siempre la versión más reciente (p. ej. tras editarla).
  const sheetRecipe = openRecipe ? (recipes.byId.get(openRecipe.recipe.id) ?? openRecipe.recipe) : null;

  const addRecipeToList = (recipe: Recipe) => {
    const items = aggregateIngredients([recipe]);
    void shopping.addItems(items);
    showToast(`${items.length} ingredientes añadidos a la Lista Común`);
  };

  return (
    <div className="min-h-dvh">
      <header className="pt-safe sticky top-0 z-30 bg-sand-50/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 md:h-16">
          <div className="flex items-center gap-2.5">
            <img src="/icons/icon-192.png" alt="" className="h-9 w-9 rounded-full" width={36} height={36} />
            <div className="leading-none">
              <h1 className="font-display text-xl font-bold tracking-tight text-ink-900">Mediterráneo 5</h1>
              <p className="mt-0.5 hidden text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-400 sm:block">Recetario como una app</p>
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
            onSwap={(slot) => setPicker({ mode: 'swap', slot })}
            onAdd={(slot) => setPicker({ mode: 'add', slot: { ...slot, index: -1 } })}
            onOpenBalance={() => setBalanceOpen(true)}
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
        {tab === 'recipes' && (
          <RecipesView onOpen={(recipe) => setOpenRecipe({ recipe })} onNew={() => setEditing({ recipe: null })} onAddToMenu={setPlacing} needs={needs} />
        )}
      </main>

      <BottomNav variant="bottom" tab={tab} onChange={changeTab} pendingCount={shopping.pending} />

      {balanceOpen && (
        <BalancePanel
          week={planner.activeWeek}
          current={evaluation.current}
          original={evaluation.original}
          recommendations={recommendations}
          onOpenRecipe={(recipe) => setOpenRecipe({ recipe })}
          onAddToMenu={(recipe) => {
            if (recipe.origin === 'sugerencia') recipeStore.acceptSuggestion(recipe.id);
            setPlacing(recipe);
          }}
          onClose={() => setBalanceOpen(false)}
        />
      )}

      {openRecipe && sheetRecipe && (
        <RecipeSheet
          key={sheetRecipe.id}
          recipe={sheetRecipe}
          onClose={() => setOpenRecipe(null)}
          onAddToList={addRecipeToList}
          onSwap={openRecipe.slot ? () => setPicker({ mode: 'swap', slot: openRecipe.slot! }) : undefined}
          onEdit={(recipe) => setEditing({ recipe })}
          onAddToMenu={(recipe) => {
            if (recipe.origin === 'sugerencia') recipeStore.acceptSuggestion(recipe.id);
            setPlacing(recipe);
          }}
          usage={planner.usage.get(sheetRecipe.id)}
        />
      )}

      {picker && (
        <RecipePicker
          mode={picker.mode}
          week={picker.slot.week}
          day={picker.slot.day}
          meal={picker.slot.meal}
          current={planner.getSlot(picker.slot.week, picker.slot.day, picker.slot.meal)}
          currentId={picker.mode === 'swap' ? planner.getSlot(picker.slot.week, picker.slot.day, picker.slot.meal)[picker.slot.index]?.id : undefined}
          originalId={picker.mode === 'swap' ? getDefaultSlot(picker.slot.week, picker.slot.day, picker.slot.meal)[picker.slot.index] : undefined}
          onSelect={(recipe) => {
            const { week, day, meal, index } = picker.slot;
            if (picker.mode === 'swap') {
              planner.swapDish(week, day, meal, index, recipe.id);
              showToast('Plato cambiado en el calendario');
            } else {
              // Primeros, guarniciones y ensaladas se colocan delante del segundo.
              planner.addDish(week, day, meal, recipe.id, recipe.dishType !== 'principal');
              showToast(`${recipe.title} añadido como acompañamiento`);
            }
          }}
          onClose={() => setPicker(null)}
        />
      )}

      {editing && (
        <RecipeEditor
          recipe={editing.recipe}
          onClose={() => setEditing(null)}
          onSaved={(recipe) => {
            showToast(editing.recipe ? 'Receta guardada' : 'Receta creada');
            setOpenRecipe({ recipe });
          }}
        />
      )}

      {placing && (
        <SlotChooser recipe={placing} planner={planner} onClose={() => setPlacing(null)} onDone={(msg) => showToast(msg)} />
      )}

      <Toast message={toast} />
    </div>
  );
}
