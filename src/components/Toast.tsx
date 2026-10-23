import { CircleCheck } from 'lucide-react';

export function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="animate-pop pointer-events-none fixed inset-x-4 bottom-[calc(9rem+var(--safe-area-inset-bottom,env(safe-area-inset-bottom)))] z-[60] mx-auto flex max-w-md items-center gap-2 rounded-2xl bg-ink-900 px-4 py-3 text-sm font-medium text-white shadow-xl md:bottom-8"
    >
      <CircleCheck className="h-5 w-5 shrink-0 text-ink-200" />
      {message}
    </div>
  );
}
