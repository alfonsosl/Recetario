import { PartyPopper, Undo2 } from 'lucide-react';

interface Props {
  seconds: number;
  itemCount: number;
  onUndo: () => void;
}

/** Aviso de celebración al completar la lista, con cuenta atrás antes de archivarla. */
export function CompletionOverlay({ seconds, itemCount, onUndo }: Props) {
  return (
    <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-ink-900/70 p-6 backdrop-blur-sm" role="alertdialog" aria-live="assertive" aria-label="Lista de la compra completada">
      <div className="animate-pop w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-2xl">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-lemon-100">
          <PartyPopper className="h-10 w-10 text-ink-400" />
        </div>
        <h2 className="mt-4 font-display text-2xl font-semibold text-ink-900">¡Lista de la compra completada!</h2>
        <p className="mt-2 text-ink-600">
          {itemCount} producto{itemCount === 1 ? '' : 's'} comprado{itemCount === 1 ? '' : 's'}. Archivando en el historial…
        </p>
        <div className="mx-auto mt-5 flex h-16 w-16 items-center justify-center rounded-full border-4 border-ink-200 font-display text-3xl font-bold text-ink-700">
          {seconds}
        </div>
        <button
          type="button"
          onClick={onUndo}
          className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-full px-5 font-semibold text-ink-600 hover:bg-sand-100"
        >
          <Undo2 className="h-5 w-5" /> Deshacer último marcado
        </button>
      </div>
    </div>
  );
}
