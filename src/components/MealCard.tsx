import { ArrowLeftRight, Clock, Moon, Sun } from 'lucide-react';
import { DISH_TYPE_LABEL } from '../data';
import type { MealType, Recipe } from '../types';
import { RecipeImage } from './RecipeImage';

interface Props {
  dishes: Recipe[];
  meal: MealType;
  swapped: boolean;
  onOpen: (recipe: Recipe, index: number) => void;
  onSwap: (index: number) => void;
  compact?: boolean;
}

/** Tarjeta de Comida/Cena del calendario: uno o dos platos (p. ej. crema + tortilla). */
export function MealCard({ dishes, meal, swapped, onOpen, onSwap, compact = false }: Props) {
  const MealIcon = meal === 'comida' ? Sun : Moon;
  const hero = dishes.find((d) => d.dishType === 'principal') ?? dishes[0];
  const totalTime = Math.max(...dishes.map((d) => d.prepTime + d.cookTime));
  const label = meal === 'comida' ? 'Comida' : 'Cena';

  if (compact) {
    return (
      <article className="overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-sm">
        <button type="button" onClick={() => onOpen(hero, dishes.indexOf(hero))} className="block w-full" aria-label={`Ver receta: ${hero.title}`}>
          <RecipeImage src={hero.image} alt={hero.title} width={320} sizes="160px" className="aspect-[4/3] w-full" />
        </button>
        <div className="p-2">
          <p className={`flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide ${meal === 'comida' ? 'text-terra-600' : 'text-sea-600'}`}>
            <MealIcon className="h-3 w-3" /> {label}
            {swapped && <span className="rounded-full bg-sand-100 px-1.5 normal-case tracking-normal text-stone-500">cambiado</span>}
          </p>
          <ul className="mt-1 space-y-1">
            {dishes.map((d, i) => (
              <li key={`${d.id}-${i}`} className="flex items-start gap-1">
                <button type="button" onClick={() => onOpen(d, i)} className="min-w-0 flex-1 text-left font-display text-sm font-semibold leading-snug text-stone-900 hover:text-olive-700">
                  <span className="line-clamp-2">{d.title}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSwap(i)}
                  title="Cambiar plato"
                  aria-label={`Cambiar ${d.title}`}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-stone-400 hover:bg-sand-100 hover:text-stone-700"
                >
                  <ArrowLeftRight className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </article>
    );
  }

  return (
    <article className="overflow-hidden rounded-3xl border border-sand-200 bg-white shadow-sm">
      <button type="button" onClick={() => onOpen(hero, dishes.indexOf(hero))} className="relative block w-full" aria-label={`Ver receta: ${hero.title}`}>
        <RecipeImage src={hero.image} alt={hero.title} width={700} sizes="100vw" className="aspect-[16/8] w-full" />
        <span
          className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-wide shadow backdrop-blur ${
            meal === 'comida' ? 'text-terra-600' : 'text-sea-600'
          }`}
        >
          <MealIcon className="h-4 w-4" /> {label}
          {swapped && <span className="font-medium normal-case tracking-normal text-stone-500">· cambiado</span>}
        </span>
      </button>
      <ul className="divide-y divide-sand-200">
        {dishes.map((d, i) => (
          <li key={`${d.id}-${i}`} className="flex items-stretch">
            <button type="button" onClick={() => onOpen(d, i)} className="min-w-0 flex-1 px-4 py-3 text-left active:bg-sand-100" aria-label={`Ver receta: ${d.title}`}>
              {dishes.length > 1 && (
                <span className="block text-xs font-semibold uppercase tracking-wide text-stone-400">{DISH_TYPE_LABEL[d.dishType]}</span>
              )}
              <span className="block font-display text-lg font-semibold leading-snug text-stone-900">{d.title}</span>
              <span className="mt-1 flex items-center gap-1.5 text-sm text-stone-500">
                <Clock className="h-4 w-4" /> {d.prepTime + d.cookTime} min · 5 pers.
              </span>
            </button>
            <button
              type="button"
              onClick={() => onSwap(i)}
              title="Cambiar plato"
              aria-label={`Cambiar ${d.title}`}
              className="flex w-14 shrink-0 items-center justify-center text-stone-500 hover:bg-sand-100 active:bg-sand-200"
            >
              <ArrowLeftRight className="h-5 w-5" />
            </button>
          </li>
        ))}
      </ul>
      {dishes.length > 1 && <p className="border-t border-sand-200 px-4 py-2 text-xs text-stone-500">Tiempo total aprox.: {totalTime} min</p>}
    </article>
  );
}
