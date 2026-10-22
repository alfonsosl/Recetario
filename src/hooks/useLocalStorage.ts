import { useCallback, useState } from 'react';

/** Estado persistido en localStorage, tolerante a modo privado o almacenamiento bloqueado. */
export function useLocalStorage<T>(key: string, initial: T | (() => T)) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) return JSON.parse(raw) as T;
    } catch {
      /* ignorar */
    }
    const value = typeof initial === 'function' ? (initial as () => T)() : initial;
    // Se persiste el valor inicial para que los generados (p. ej. el Código de Hogar aleatorio) sean estables.
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignorar */
    }
    return value;
  });

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === 'function' ? (next as (p: T) => T)(prev) : next;
        try {
          localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          /* ignorar */
        }
        return resolved;
      });
    },
    [key],
  );

  return [value, set] as const;
}
