import { Cloud, HardDrive, House, Pencil, User } from 'lucide-react';
import { useState } from 'react';
import type { SyncStatus } from '../../hooks/useShoppingList';
import type { SyncMode } from '../../services/shoppingSync';

interface Props {
  userName: string;
  onUserName: (n: string) => void;
  household: string;
  onHousehold: (c: string) => void;
  mode: SyncMode;
  status: SyncStatus;
}

const PRESETS = ['Carlos', 'Ana', 'Invitado'];

/** Identificación rápida: nombre del usuario y Código de Hogar compartido, guardados en el teléfono. */
export function IdentityBar({ userName, onUserName, household, onHousehold, mode, status }: Props) {
  const [editingName, setEditingName] = useState(!userName);
  const [nameDraft, setNameDraft] = useState(userName);
  const [editingCode, setEditingCode] = useState(false);
  const [codeDraft, setCodeDraft] = useState(household);

  const presets = userName && !PRESETS.includes(userName) ? [userName, ...PRESETS] : PRESETS;

  const statusDot =
    status === 'online' ? 'bg-emerald-500' : status === 'connecting' ? 'bg-amber-400 animate-pulse' : 'bg-red-500';

  return (
    <section className="space-y-3 rounded-3xl border border-sand-200 bg-white p-3">
      <div>
        <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-stone-500">
          <User className="h-3.5 w-3.5" /> ¿Quién eres?
        </p>
        <div className="scrollbar-none -mx-3 flex gap-2 overflow-x-auto px-3">
          {presets.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => {
                onUserName(p);
                setEditingName(false);
              }}
              aria-pressed={userName === p}
              className={`min-h-11 shrink-0 rounded-full px-4 text-sm font-semibold transition-colors ${
                userName === p ? 'bg-olive-600 text-white' : 'bg-sand-100 text-stone-700 hover:bg-sand-200'
              }`}
            >
              {p}
            </button>
          ))}
          {!editingName && (
            <button
              type="button"
              onClick={() => {
                setNameDraft('');
                setEditingName(true);
              }}
              className="min-h-11 shrink-0 rounded-full border border-dashed border-sand-300 px-4 text-sm font-semibold text-stone-500"
            >
              Otro nombre…
            </button>
          )}
        </div>
        {editingName && (
          <form
            className="mt-2 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (nameDraft.trim()) {
                onUserName(nameDraft);
                setEditingName(false);
              }
            }}
          >
            <input
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              placeholder="Escribe tu nombre"
              autoComplete="given-name"
              maxLength={30}
              className="h-11 min-w-0 flex-1 rounded-xl border border-sand-300 px-3 text-base outline-none focus:border-olive-500 focus:ring-2 focus:ring-olive-200"
            />
            <button type="submit" className="h-11 rounded-xl bg-olive-600 px-4 font-semibold text-white">
              Guardar
            </button>
          </form>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-sand-200 pt-3">
        <House className="h-4 w-4 text-stone-500" aria-hidden />
        <span className="text-sm text-stone-500">Código de Hogar:</span>
        {editingCode ? (
          <form
            className="flex flex-1 gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (codeDraft.trim().length >= 3) {
                onHousehold(codeDraft);
                setEditingCode(false);
              }
            }}
          >
            <input
              value={codeDraft}
              onChange={(e) => setCodeDraft(e.target.value.toUpperCase())}
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              minLength={3}
              maxLength={40}
              aria-label="Código de Hogar"
              className="h-10 min-w-0 flex-1 rounded-xl border border-sand-300 px-3 font-mono text-base uppercase outline-none focus:border-olive-500"
            />
            <button type="submit" className="h-10 rounded-xl bg-olive-600 px-3 text-sm font-semibold text-white">
              Unirme
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => {
              setCodeDraft(household);
              setEditingCode(true);
            }}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-sand-100 px-3 font-mono text-sm font-bold text-stone-800"
            title="Comparte este código con tu familia para usar la misma lista"
          >
            {household} <Pencil className="h-3.5 w-3.5 text-stone-500" />
          </button>
        )}
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-sand-100 px-2.5 py-1 text-xs font-medium text-stone-600" title={mode === 'supabase' ? 'Sincronizado entre dispositivos con Supabase Realtime' : 'Guardado en este navegador; se sincroniza entre pestañas'}>
          <span className={`h-2 w-2 rounded-full ${statusDot}`} />
          {mode === 'supabase' ? <Cloud className="h-3.5 w-3.5" /> : <HardDrive className="h-3.5 w-3.5" />}
          {mode === 'supabase' ? 'En la nube' : 'Solo este dispositivo'}
        </span>
      </div>
    </section>
  );
}
