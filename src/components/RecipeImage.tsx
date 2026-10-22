import { ChefHat } from 'lucide-react';
import { useState } from 'react';

interface Props {
  src: string;
  alt: string;
  className?: string;
  /** Ancho base solicitado a Unsplash. Se generan variantes 1x/2x. */
  width?: number;
  sizes?: string;
  eager?: boolean;
}

const withWidth = (src: string, w: number) => `${src}${src.includes('?') ? '&' : '?'}w=${w}`;

/**
 * Imagen de receta con skeleton mientras carga (conexiones móviles lentas)
 * y fallback ilustrado si la URL falla o no hay conexión.
 */
export function RecipeImage({ src, alt, className = '', width = 600, sizes = '100vw', eager = false }: Props) {
  // El estado va ligado a la URL: si cambia la imagen, vuelve a "cargando" sin efectos extra.
  const [result, setResult] = useState<{ src: string; status: 'loaded' | 'error' } | null>(null);
  const status = result?.src === src ? result.status : 'loading';
  const setStatus = (s: 'loaded' | 'error') => setResult({ src, status: s });

  return (
    <div className={`relative overflow-hidden bg-sand-200 ${className}`}>
      {status === 'loading' && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-sand-200 via-sand-100 to-sand-200" aria-hidden />
      )}
      {status === 'error' ? (
        <div
          role="img"
          aria-label={alt}
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-olive-100 via-sand-100 to-terra-100 p-3 text-center"
        >
          <ChefHat className="h-8 w-8 text-olive-600" aria-hidden />
          <span className="line-clamp-2 text-xs font-medium text-olive-800">{alt}</span>
        </div>
      ) : (
        <img
          src={withWidth(src, width)}
          srcSet={`${withWidth(src, width)} 1x, ${withWidth(src, width * 2)} 2x`}
          sizes={sizes}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
          className={`h-full w-full object-cover transition-opacity duration-500 ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
    </div>
  );
}
