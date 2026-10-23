import type { Recipe, RecipeCategory } from '../types';

/** Color del borde del plato por tipo de receta (cuencos de colores, como en el estilo de referencia). */
const RIM: Record<RecipeCategory, string> = {
  legumbre: '#c98b5a',
  arroz: '#e0b23a',
  pasta: '#d9734e',
  carne: '#a8574a',
  pescado: '#4f7d95',
  huevo: '#e8c547',
  verdura: '#6f9a54',
  ensalada: '#7fae6a',
  masa_frito: '#c9925a',
  guarnicion: '#9b9b93',
};

interface Props {
  recipe: Pick<Recipe, 'emoji' | 'category' | 'title'>;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES = {
  xs: { box: 'h-11 w-11', emoji: 'text-xl' },
  sm: { box: 'h-16 w-16', emoji: 'text-3xl' },
  md: { box: 'h-28 w-28', emoji: 'text-5xl' },
  lg: { box: 'h-44 w-44 md:h-52 md:w-52', emoji: 'text-7xl md:text-8xl' },
};

/**
 * Ilustración del plato visto desde arriba: plato con borde de color y el icono del alimento.
 * Sustituye a las fotografías (no se muestran fotos que no correspondan a la receta).
 */
export function DishArt({ recipe, size = 'md', className = '' }: Props) {
  const s = SIZES[size];
  return (
    <div
      role="img"
      aria-label={recipe.title}
      className={`relative flex shrink-0 items-center justify-center rounded-full ${s.box} ${className}`}
      style={{
        background: `radial-gradient(circle at 50% 50%, #ffffff 0 56%, #f3f1ec 57% 62%, ${RIM[recipe.category]} 63% 100%)`,
        boxShadow: '0 10px 24px -10px rgba(16,16,15,0.35), inset 0 0 0 1px rgba(0,0,0,0.04)',
      }}
    >
      <span className={`${s.emoji} leading-none drop-shadow-sm select-none`} aria-hidden>
        {recipe.emoji}
      </span>
    </div>
  );
}
