import { useCallback, useEffect, useId, useRef } from 'react';

/**
 * Para overlays a pantalla completa en móvil: el botón/gesto "atrás" cierra el overlay
 * en lugar de salir de la app. Bloquea el scroll del body y cierra con Escape.
 * Devuelve requestClose(then?): cierra pasando por el historial y, opcionalmente,
 * ejecuta `then` una vez cerrado (útil para abrir otro overlay a continuación).
 */
export function useBackToClose(onClose: () => void) {
  const onCloseRef = useRef(onClose);
  const afterRef = useRef<(() => void) | null>(null);
  const token = useRef(useId());

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const t = token.current;
    if ((history.state as { med5Overlay?: string } | null)?.med5Overlay !== t) {
      history.pushState({ med5Overlay: t }, '');
    }
    const onPop = () => {
      onCloseRef.current();
      const after = afterRef.current;
      afterRef.current = null;
      after?.();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') history.back();
    };
    window.addEventListener('popstate', onPop);
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  return useCallback((then?: () => void) => {
    afterRef.current = then ?? null;
    history.back();
  }, []);
}
