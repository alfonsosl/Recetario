import { Plus, RotateCcw, Save, Trash2, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { CATEGORY_LABEL, DISH_TYPE_LABEL, EMOJI_CHOICES } from '../data';
import { useBackToClose } from '../hooks/useBackToClose';
import { uid } from '../services/shoppingSync';
import { recipeStore } from '../store/recipeStore';
import type { Difficulty, DishType, Ingredient, MealType, NutritionGroup, Recipe, RecipeCategory, Section, Unit } from '../types';
import { KNOWN_PRODUCTS } from '../utils/categoryGuess';
import { DishArt } from './DishArt';

interface Props {
  /** Receta a editar; null para crear una nueva. */
  recipe: Recipe | null;
  onClose: () => void;
  onSaved: (recipe: Recipe) => void;
}

interface IngredientDraft {
  name: string;
  quantity: string;
  unit: Unit;
  section: Section;
  optional: boolean;
  fromRecipe?: string;
}

const UNITS: [Unit, string][] = [
  ['g', 'g'],
  ['ml', 'ml'],
  ['ud', 'ud'],
  ['diente', 'diente'],
  ['cdta', 'cdta'],
  ['hoja', 'hoja'],
  ['manojo', 'manojo'],
  ['al_gusto', 'al gusto'],
];

const SECTIONS: [Section, string][] = [
  ['verdura_fruta', 'Verdura y fruta'],
  ['carne', 'Carne'],
  ['pescado', 'Pescado'],
  ['huevos_lacteos', 'Huevos y lácteos'],
  ['panaderia_refrigerados', 'Panadería y refrig.'],
  ['congelados', 'Congelados'],
  ['despensa', 'Despensa'],
  ['especias', 'Especias'],
  ['aprovechamiento', 'Sobras (no se compra)'],
];

const GROUPS: [NutritionGroup | '', string][] = [
  ['', 'Ninguna (acompañamiento)'],
  ['legumbre', 'Legumbre'],
  ['pescado', 'Pescado'],
  ['carne', 'Carne'],
  ['huevo', 'Huevo'],
];

/** Sección por defecto de un ingrediente según el recetario. */
const KNOWN_SECTION = new Map<string, Section>();
for (const r of recipeStore.getSnapshot().all) for (const i of r.ingredients) KNOWN_SECTION.set(i.name.toLowerCase(), i.section);

/** Proteína principal sugerida a partir de los ingredientes. */
function suggestGroup(ings: IngredientDraft[]): NutritionGroup | '' {
  const q = (i: IngredientDraft) => Number(i.quantity.replace(',', '.')) || 0;
  const active = ings.filter((i) => i.name.trim() && !i.optional);
  if (active.some((i) => /lenteja|garbanzo|alubia|judi[oó]n/i.test(i.name) && (i.unit !== 'g' || q(i) >= 300))) return 'legumbre';
  if (active.some((i) => i.section === 'pescado' || /at[uú]n|bonito|bacalao/i.test(i.name))) return 'pescado';
  if (active.some((i) => i.section === 'carne' && (i.unit !== 'g' || q(i) >= 300))) return 'carne';
  if (active.some((i) => /huevo/i.test(i.name) && q(i) >= 4)) return 'huevo';
  return '';
}

const toDraft = (i: Ingredient): IngredientDraft => ({
  name: i.name,
  quantity: i.quantity === null ? '' : String(i.quantity).replace('.', ','),
  unit: i.unit,
  section: i.section,
  optional: i.optional,
  ...(i.fromRecipe ? { fromRecipe: i.fromRecipe } : {}),
});

const emptyIngredient = (): IngredientDraft => ({ name: '', quantity: '', unit: 'g', section: 'despensa', optional: false });

const field = 'h-11 w-full rounded-xl border border-sand-300 bg-white px-3 text-base outline-none focus:border-ink-600 focus:ring-2 focus:ring-lemon-200';
const label = 'mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-400';

/** Editor de recetas: cambia nombre, ingredientes, pasos y datos del plato. Se guarda en el móvil. */
export function RecipeEditor({ recipe, onClose, onSaved }: Props) {
  const requestClose = useBackToClose(onClose);
  const isNew = recipe === null;
  const isBase = recipe ? recipeStore.isBase(recipe.id) : false;
  const isEdited = recipe ? recipeStore.getSnapshot().editedIds.has(recipe.id) : false;

  const [title, setTitle] = useState(recipe?.title ?? '');
  const [emoji, setEmoji] = useState(recipe?.emoji ?? '🍲');
  const [category, setCategory] = useState<RecipeCategory>(recipe?.category ?? 'legumbre');
  const [dishType, setDishType] = useState<DishType>(recipe?.dishType ?? 'principal');
  const [moments, setMoments] = useState<MealType[]>(recipe?.moments ?? ['comida']);
  const [group, setGroup] = useState<NutritionGroup | ''>(recipe ? (recipe.group ?? '') : '');
  const [groupTouched, setGroupTouched] = useState(!isNew);
  const [prep, setPrep] = useState(String(recipe?.prepTime ?? 15));
  const [cook, setCook] = useState(String(recipe?.cookTime ?? 30));
  const [difficulty, setDifficulty] = useState<Difficulty>(recipe?.difficulty ?? 'baja');
  const [tags, setTags] = useState((recipe?.tags ?? []).join(', '));
  const [ingredients, setIngredients] = useState<IngredientDraft[]>(recipe ? recipe.ingredients.map(toDraft) : [emptyIngredient()]);
  const [steps, setSteps] = useState((recipe?.steps ?? []).join('\n'));
  const [notes, setNotes] = useState(recipe?.notes ?? '');
  const [storage, setStorage] = useState(recipe?.storage ?? '');
  const [error, setError] = useState<string | null>(null);

  const suggested = useMemo(() => suggestGroup(ingredients), [ingredients]);
  const effectiveGroup = groupTouched ? group : suggested;

  const updateIng = (i: number, patch: Partial<IngredientDraft>) =>
    setIngredients((list) =>
      list.map((x, j) => {
        if (j !== i) return x;
        const next = { ...x, ...patch };
        // Al escribir un producto conocido, se propone su sección.
        if (patch.name !== undefined) {
          const sec = KNOWN_SECTION.get(patch.name.trim().toLowerCase());
          if (sec) next.section = sec;
        }
        if (patch.unit === 'al_gusto') next.quantity = '';
        return next;
      }),
    );

  const save = () => {
    const cleanIngs = ingredients.filter((i) => i.name.trim());
    if (!title.trim()) return setError('Escribe el nombre del plato.');
    if (cleanIngs.length === 0) return setError('Añade al menos un ingrediente.');
    if (moments.length === 0) return setError('Elige si es de comida, de cena o de ambas.');
    for (const i of cleanIngs) {
      if (i.unit !== 'al_gusto' && !(Number(i.quantity.replace(',', '.')) > 0)) {
        return setError(`Indica la cantidad de "${i.name}" o marca la unidad "al gusto".`);
      }
    }
    const result: Recipe = {
      id: recipe?.id ?? `propia_${uid().slice(0, 8)}`,
      title: title.trim(),
      category,
      moments,
      dishType,
      servings: 5,
      prepTime: Math.max(0, Number(prep) || 0),
      cookTime: Math.max(0, Number(cook) || 0),
      difficulty,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      origin: recipe?.origin ?? 'propia',
      group: effectiveGroup || null,
      emoji,
      ingredients: cleanIngs.map((i) => ({
        name: i.name.trim().toLowerCase(),
        quantity: i.unit === 'al_gusto' ? null : Number(i.quantity.replace(',', '.')),
        unit: i.unit,
        section: i.fromRecipe ? 'aprovechamiento' : i.section,
        optional: i.optional,
        ...(i.fromRecipe ? { fromRecipe: i.fromRecipe } : {}),
      })),
      steps: steps
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      notes: notes.trim(),
      storage: storage.trim(),
      generates: recipe?.generates ?? [],
    };
    recipeStore.save(result);
    requestClose(() => onSaved(result));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6" role="dialog" aria-modal="true" aria-label={isNew ? 'Nueva receta' : 'Editar receta'}>
      <div className="animate-fade-in absolute inset-0 bg-ink-900/40" onClick={() => requestClose()} aria-hidden />
      <div className="animate-sheet-up relative flex h-full w-full flex-col bg-sand-50 md:h-[92vh] md:max-w-3xl md:rounded-[28px] md:shadow-2xl">
        <header className="pt-safe flex items-center gap-2 border-b border-sand-200 px-2 py-2">
          <button type="button" onClick={() => requestClose()} className="flex h-12 w-12 items-center justify-center rounded-full hover:bg-sand-100" aria-label="Cancelar">
            <X className="h-7 w-7" />
          </button>
          <h2 className="min-w-0 flex-1 truncate font-display text-lg font-bold text-ink-900">{isNew ? 'Nueva receta' : 'Editar receta'}</h2>
          <button type="button" onClick={save} className="inline-flex h-11 items-center gap-2 rounded-full bg-ink-800 px-5 font-semibold text-white hover:bg-ink-700">
            <Save className="h-4 w-4" /> Guardar
          </button>
        </header>

        <div className="pb-safe flex-1 space-y-6 overflow-y-auto overscroll-contain p-4 md:p-8">
          {error && (
            <p role="alert" className="rounded-xl bg-lemon-100 p-3 text-sm font-medium text-ink-800">
              {error}
            </p>
          )}

          {/* Identidad del plato */}
          <section className="flex items-start gap-4">
            <DishArt recipe={{ emoji, category, title: title || 'Plato' }} size="md" />
            <div className="min-w-0 flex-1 space-y-3">
              <label className="block">
                <span className={label}>Nombre del plato</span>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej.: Lentejas con verduras" className={`${field} font-display font-bold`} maxLength={80} />
              </label>
              <div>
                <span className={label}>Icono</span>
                <div className="scrollbar-none -mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
                  {EMOJI_CHOICES.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setEmoji(e)}
                      aria-pressed={emoji === e}
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl ${emoji === e ? 'bg-lemon-300' : 'bg-white ring-1 ring-sand-200'}`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-3 md:grid-cols-3">
            <label>
              <span className={label}>Tipo de cocina</span>
              <select value={category} onChange={(e) => setCategory(e.target.value as RecipeCategory)} className={field}>
                {Object.entries(CATEGORY_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className={label}>Tipo de plato</span>
              <select value={dishType} onChange={(e) => setDishType(e.target.value as DishType)} className={field}>
                {Object.entries(DISH_TYPE_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
            <div className="col-span-2 md:col-span-1">
              <span className={label}>Momento</span>
              <div className="flex gap-2">
                {(['comida', 'cena'] as const).map((m) => {
                  const on = moments.includes(m);
                  return (
                    <button
                      key={m}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setMoments((list) => (on ? list.filter((x) => x !== m) : [...list, m]))}
                      className={`h-11 flex-1 rounded-full text-sm font-semibold capitalize ${on ? 'bg-ink-800 text-white' : 'bg-white text-ink-500 ring-1 ring-sand-300'}`}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>
            <label className="col-span-2 md:col-span-1">
              <span className={label}>Proteína principal (equilibrio)</span>
              <select
                value={effectiveGroup}
                onChange={(e) => {
                  setGroup(e.target.value as NutritionGroup | '');
                  setGroupTouched(true);
                }}
                className={field}
              >
                {GROUPS.map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                    {!groupTouched && k === suggested ? ' (detectado)' : ''}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className={label}>Preparación (min)</span>
              <input value={prep} onChange={(e) => setPrep(e.target.value.replace(/\D/g, ''))} inputMode="numeric" className={field} />
            </label>
            <label>
              <span className={label}>Cocción (min)</span>
              <input value={cook} onChange={(e) => setCook(e.target.value.replace(/\D/g, ''))} inputMode="numeric" className={field} />
            </label>
            <label>
              <span className={label}>Dificultad</span>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)} className={field}>
                <option value="baja">Fácil</option>
                <option value="media">Media</option>
                <option value="alta">Elaborada</option>
              </select>
            </label>
            <label className="col-span-2">
              <span className={label}>Etiquetas (separadas por comas)</span>
              <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="cuchara, congelable, frito…" className={field} />
            </label>
          </section>

          {/* Ingredientes */}
          <section>
            <div className="mb-2 flex items-baseline justify-between">
              <h3 className="font-display text-base font-bold text-ink-900">Ingredientes · 5 personas</h3>
              <span className="text-xs text-ink-400">{ingredients.filter((i) => i.name.trim()).length} ingredientes</span>
            </div>
            <ul className="space-y-2">
              {ingredients.map((ing, i) => (
                <li key={i} className="rounded-2xl border border-sand-200 bg-white p-3">
                  <div className="flex gap-2">
                    <input
                      value={ing.name}
                      onChange={(e) => updateIng(i, { name: e.target.value })}
                      list="med5-editor-products"
                      placeholder="Ingrediente"
                      aria-label={`Ingrediente ${i + 1}`}
                      className={`${field} flex-1`}
                    />
                    <button
                      type="button"
                      onClick={() => setIngredients((list) => list.filter((_, j) => j !== i))}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-ink-300 hover:bg-sand-100 hover:text-red-600"
                      aria-label={`Quitar ${ing.name || 'ingrediente'}`}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="mt-2 grid grid-cols-[5rem_6rem_1fr] gap-2">
                    <input
                      value={ing.quantity}
                      onChange={(e) => updateIng(i, { quantity: e.target.value.replace(/[^\d.,]/g, '') })}
                      disabled={ing.unit === 'al_gusto'}
                      inputMode="decimal"
                      placeholder="Cant."
                      aria-label="Cantidad"
                      className={`${field} text-center disabled:bg-sand-100`}
                    />
                    <select value={ing.unit} onChange={(e) => updateIng(i, { unit: e.target.value as Unit })} aria-label="Unidad" className={field}>
                      {UNITS.map(([k, v]) => (
                        <option key={k} value={k}>
                          {v}
                        </option>
                      ))}
                    </select>
                    <select value={ing.section} onChange={(e) => updateIng(i, { section: e.target.value as Section })} aria-label="Sección del supermercado" className={field}>
                      {SECTIONS.map(([k, v]) => (
                        <option key={k} value={k}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>
                  <label className="mt-2 inline-flex min-h-9 items-center gap-2 text-sm text-ink-500">
                    <input type="checkbox" checked={ing.optional} onChange={(e) => updateIng(i, { optional: e.target.checked })} className="h-4 w-4 accent-ink-800" />
                    Opcional (no entra en la compra)
                  </label>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => setIngredients((list) => [...list, emptyIngredient()])}
              className="mt-2 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-ink-300 font-semibold text-ink-600 hover:bg-white"
            >
              <Plus className="h-5 w-5" /> Añadir ingrediente
            </button>
            <datalist id="med5-editor-products">
              {KNOWN_PRODUCTS.map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>
          </section>

          {/* Pasos y notas */}
          <section className="space-y-3">
            <label className="block">
              <span className={label}>Preparación · un paso por línea</span>
              <textarea value={steps} onChange={(e) => setSteps(e.target.value)} rows={7} className={`${field} h-auto py-2 leading-relaxed`} />
            </label>
            <label className="block">
              <span className={label}>Notas</span>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={`${field} h-auto py-2`} />
            </label>
            <label className="block">
              <span className={label}>Conservación</span>
              <input value={storage} onChange={(e) => setStorage(e.target.value)} className={field} />
            </label>
          </section>

          {!isNew && (
            <section className="flex flex-wrap gap-2 border-t border-sand-200 pt-4">
              {isBase && isEdited && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('¿Volver a la receta original del recetario? Se perderán tus cambios.')) {
                      recipeStore.restore(recipe!.id);
                      requestClose(() => onSaved(recipeStore.getById(recipe!.id)!));
                    }
                  }}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-ink-200 px-4 text-sm font-semibold text-ink-700 hover:bg-white"
                >
                  <RotateCcw className="h-4 w-4" /> Restaurar original
                </button>
              )}
              {!isBase && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('¿Eliminar esta receta? Si está en el menú, ese día vuelve al plato original.')) {
                      recipeStore.remove(recipe!.id);
                      requestClose();
                    }
                  }}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-red-200 px-4 text-sm font-semibold text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" /> Eliminar receta
                </button>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
