'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[60]">
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <div className="absolute left-1/2 top-1/2 w-[min(980px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl bg-white shadow-[0_25px_60px_-35px_rgba(0,0,0,0.65)] ring-1 ring-black/10">
        {title ? (
          <div className="flex items-center justify-between gap-4 border-b border-black/10 px-5 py-4">
            <p className="text-sm font-extrabold uppercase tracking-[0.12em] text-zinc-700">{title}</p>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-[#F3F4F6] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-zinc-900 hover:bg-zinc-200"
            >
              Close
            </button>
          </div>
        ) : null}
        <div className="p-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

