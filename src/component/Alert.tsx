import { X } from 'lucide-react';
import type { ReactNode } from 'react';

type AlertProps = {
  children: ReactNode;
  variant?: 'error' | 'loading';
  onClose?: () => void;
};

export function Alert({ children, variant = 'error', onClose }: AlertProps) {
  const styles = variant === 'loading'
    ? 'border-border bg-white text-muted'
    : 'border-red-200 bg-red-50 text-red-700';

  return (
    <div 
      role={variant === 'error' ? 'alert' : 'status'} 
      className={`flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${styles}`}
    >
      <span>{children}</span>
      {onClose && (
        <button type="button" onClick={onClose} aria-label="Cerrar mensaje" className="shrink-0 rounded p-0.5 hover:bg-black/5">
          <X size={16} />
        </button>
      )}
    </div>
  );
}
