import { X } from "lucide-react";
import type { ReactNode } from "react";

interface Props{
    title: string
    children: ReactNode
    onClose: () => void 
}

export function Modal({ title, children, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#123242]/55 p-4 backdrop-blur-sm">
        <div 
            role="dialog" 
            aria-modal="true" 
            aria-labelledby="modal-title" 
            className="max-h-[92vh] w-full max-w-6xl overflow-auto rounded-3xl border border-white/60 bg-white p-5 shadow-2xl sm:p-7"
        >
        <div className="mb-6 flex items-start justify-between gap-4">
            <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-accent">
                    Detalle de información
                </p>
                <h2 id="modal-title" className="text-xl font-bold text-text-h sm:text-2xl">{title}</h2>
            </div>
            <button type="button" aria-label="Cerrar modal" className="rounded-xl border border-border p-2 text-muted hover:bg-bg hover:text-text-h" onClick={onClose}>
                <X size={20} />
            </button>
        </div>
            {children}
        </div>
    </div>
  );
}