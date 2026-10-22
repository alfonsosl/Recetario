import { ArrowLeftRight, Clock, Moon, Sun } from 'lucide-react';
import type { MealType, Recipe } from '../types';
import { RecipeImage } from './RecipeImage';

interface Props {
  recipe: Recipe;
  meal: MealType;
  swapped: boolean;
  onOpen: () => void;
  onSwap: () => void;
  compact?: boolean;
}

/** Tarjeta de Comida/Cena del calendario. Grande en móvil, compacta en el grid de escritorio. */
export function MealCard({ recipe, meal, swapped, onOpen, onSwap, compact = false }: Props) {
  const MealIcon = meal === 'comida' ? Sun : Moon;
  return (
    <article className="group relative overflow-hidden rounded-3xl border border-sand-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <button type="button" onClick={onOpen} className="block w-full text-left" aria-label={`Ver receta: ${recipe.title}`}>
        <RecipeImage
          src={recipe.image}
          alt={recipe.title}
          width={compact ? 320 : 700}
          sizes={compact ? '160px' : '(min-width: 768px) 50vw, 100vw'}
          className={compact ? 'aspect-[4/3] w-full' : 'aspect-[16/9] w-full'}
        />
        <div className={compact ? 'p-2.5' : 'p-4'}>
          <p
            className={`flex items-center gap-1.5 font-semibold uppercase tracking-wide ${
              meal === 'comida' ? 'text-terra-600' : 'text-sea-600'
            } ${compact ? 'text-[10px]' : 'text-xs'}`}
          >
            <MealIcon className={compact ? 'h-3 w-3' : 'h-4 w-4'} />
            {meal === 'comida' ? 'Comida' : 'Cena'}
            {swapped && <span className="rounded-full bg-sand-100 px-1.5 py-0.5 normal-case tracking-normal text-stone-500">cambiado</span>}
          </p>
          <h3
            className={`mt-1 font-display font-semibold leading-snug text-stone-900 ${
              compact ? 'line-clamp-3 text-sm' : 'text-xl'
            }`}
          >
            {recipe.title}
          </h3>
          {!compact && (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-stone-500">
              <Clock className="h-4 w-4" /> {recipe.prepTime + recipe.cookTime} min · {recipe.difficulty} · 5 pers.
            </p>
          )}
        </div>
      </button>
      <button
        type="button"
        onClick={onSwap}
        aria-label={`Cambiar ${meal === 'comida' ? 'la comida' : 'la cena'}`}
        title="Cambiar plato"
        className={`absolute right-2 top-2 flex items-center justify-center rounded-full bg-white/90 text-stone-700 shadow backdrop-blur hover:bg-white ${
          compact ? 'h-9 w-9' : 'h-12 w-12'
        }`}
      >
        <ArrowLeftRight className={compact ? 'h-4 w-4' : 'h-5 w-5'} />
      </button>
    </article>
  );
}
