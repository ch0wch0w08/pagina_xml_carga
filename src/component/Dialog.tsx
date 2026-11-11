import { AlertTriangle, LoaderCircle, X } from 'lucide-react';
import type { ReactNode } from 'react';

type DialogProps = {
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  pending?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onClose: () => void;
};

export function Dialog({
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  pending = false,
  error,
  onConfirm,
  onClose,
}: DialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#123242]/55 p-4 backdrop-blur-sm">
      <div role="alertdialog" aria-modal="true" className="w-full max-w-md rounded-3xl border border-white/60 bg-white p-6 shadow-2xl">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-red-100 p-2 text-red-600"><AlertTriangle size={20} /></div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-bold text-text-h">{title}</h2>
              <button type="button" aria-label="Cerrar diálogo" onClick={onClose} disabled={pending} className="rounded-lg p-1 text-muted hover:bg-bg disabled:opacity-50">
                <X size={18} />
              </button>
            </div>
            <p className="mt-3 text-sm text-muted">{message}</p>
            {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} disabled={pending} className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-text-h hover:bg-bg disabled:opacity-50">
            {cancelLabel}
          </button>
          <button type="button" onClick={onConfirm} disabled={pending} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50">
            {pending && <LoaderCircle size={16} className="animate-spin" />}
            {pending ? 'Eliminando...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
