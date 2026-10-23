import { Check, Trash2 } from 'lucide-react';
import type { ShoppingItem } from '../../types';

interface Props {
  item: ShoppingItem;
  /** Se muestra tachado aunque aún no haya bajado al final de la sección. */
  checked: boolean;
  onToggle: () => void;
  onRemove: () => void;
}

/** Fila con área táctil completa: tocar en cualquier punto marca/desmarca el producto. */
export function ShoppingItemRow({ item, checked, onToggle, onRemove }: Props) {
  const author = item.source === 'menu' ? 'Del Menú Semanal' : `Añadido por ${item.addedBy}`;
  return (
    <li className="animate-row-in flex items-stretch">
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={checked}
        className={`flex min-h-16 flex-1 items-center gap-3 px-4 py-2.5 text-left transition-colors active:bg-sand-100 ${checked ? 'bg-sand-50' : 'bg-white'}`}
      >
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 ${
            checked ? 'scale-95 border-ink-600 bg-ink-600 text-white' : 'border-sand-300 bg-white'
          }`}
          aria-hidden
        >
          {checked && <Check className="h-4 w-4" strokeWidth={3} />}
        </span>
        <span className="min-w-0 flex-1">
          <span
            data-checked={checked}
            className={`strike inline text-base font-semibold leading-snug ${checked ? 'text-ink-400' : 'text-ink-800'}`}
          >
            {item.name}
          </span>
          <span className={`mt-0.5 block truncate text-xs ${checked ? 'text-ink-400' : 'text-ink-500'}`}>
            {author}
            {checked && item.checkedBy ? ` · comprado por ${item.checkedBy}` : ''}
          </span>
        </span>
        {item.quantity && (
          <span className={`shrink-0 text-right text-sm font-semibold tabular-nums ${checked ? 'text-ink-400' : 'text-ink-700'}`}>
            {item.quantity}
          </span>
        )}
      </button>
      <button
        type="button"
        onClick={onRemove}
        className={`flex w-12 shrink-0 items-center justify-center text-ink-300 hover:text-red-500 active:text-red-600 ${checked ? 'bg-sand-50' : 'bg-white'}`}
        aria-label={`Eliminar ${item.name}`}
      >
        <Trash2 className="h-5 w-5" />
      </button>
    </li>
  );
}
