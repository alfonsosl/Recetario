import { Plus } from 'lucide-react';
import { useRef, useState } from 'react';
import { CATEGORIES, type Category, type NewItemInput } from '../../types';
import { CATEGORY_META } from '../../utils/categories';
import { KNOWN_PRODUCTS, guessCategory } from '../../utils/categoryGuess';

interface Props {
  onAdd: (item: NewItemInput) => void;
}

/** Barra fija estilo chat para añadir productos rápido desde el móvil. */
export function QuickAddBar({ onAdd }: Props) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [manualCategory, setManualCategory] = useState<Category | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  // Categoría sugerida automáticamente mientras se escribe, salvo que el usuario la elija a mano.
  const category: Category = manualCategory ?? guessCategory(name) ?? 'Hogar y otros';

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({ name: name.trim(), quantity: quantity.trim(), category, source: 'manual' });
    setName('');
    setQuantity('');
    setManualCategory(null);
    nameRef.current?.focus();
  };

  return (
    <form
      onSubmit={submit}
      className="fixed inset-x-0 bottom-[calc(4rem+var(--safe-area-inset-bottom,env(safe-area-inset-bottom)))] z-30 border-t border-sand-200 bg-white/95 px-3 py-2 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] backdrop-blur md:sticky md:bottom-4 md:mx-auto md:max-w-3xl md:rounded-2xl md:border"
    >
      {name.trim() && (
        <div className="scrollbar-none -mx-3 mb-2 flex gap-1.5 overflow-x-auto px-3" role="radiogroup" aria-label="Pasillo / categoría">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={category === c}
              onClick={() => setManualCategory(c)}
              className={`min-h-9 shrink-0 rounded-full px-3 text-xs font-semibold transition-colors ${
                category === c ? 'bg-ink-600 text-white' : 'bg-sand-100 text-ink-600'
              }`}
            >
              {CATEGORY_META[c].emoji} {CATEGORY_META[c].short}
            </button>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2">
        <input
          ref={nameRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          list="med5-products"
          placeholder="Añadir producto…"
          aria-label="Nombre del producto"
          enterKeyHint="send"
          autoComplete="off"
          maxLength={120}
          className="h-12 min-w-0 flex-1 rounded-full border border-sand-300 bg-sand-50 px-4 text-base outline-none focus:border-ink-500 focus:bg-white focus:ring-2 focus:ring-ink-200"
        />
        <input
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Cant."
          aria-label="Cantidad"
          enterKeyHint="send"
          autoComplete="off"
          maxLength={30}
          className="h-12 w-20 rounded-full border border-sand-300 bg-sand-50 px-3 text-center text-base outline-none focus:border-ink-500 focus:bg-white focus:ring-2 focus:ring-ink-200"
        />
        <button
          type="submit"
          disabled={!name.trim()}
          aria-label="Añadir a la lista"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-lemon-400 text-ink-900 shadow transition-colors hover:bg-lemon-300 disabled:bg-sand-300"
        >
          <Plus className="h-6 w-6" strokeWidth={2.5} />
        </button>
      </div>
      <datalist id="med5-products">
        {KNOWN_PRODUCTS.map((p) => (
          <option key={p} value={p} />
        ))}
      </datalist>
    </form>
  );
}
