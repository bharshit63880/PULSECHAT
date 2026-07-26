import type { PropsWithChildren } from 'react';

import { LazyMotion, domAnimation, m } from 'framer-motion';
import { X } from 'lucide-react';

type ModalProps = PropsWithChildren<{
  title: string;
  open: boolean;
  onClose: () => void;
}>;

export const Modal = ({ title, open, onClose, children }: ModalProps) => {
  if (!open) {
    return null;
  }

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-md"
      >
        <m.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="glass-panel w-full max-w-lg rounded-[32px] p-6 sm:p-7"
        >
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">Workspace action</p>
              <h3 className="mt-1 text-lg font-semibold tracking-tight">{title}</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-line/80 bg-white/60 text-muted transition hover:border-accent/30 hover:text-ink dark:bg-slate-950/55"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {children}
        </m.div>
      </m.div>
    </LazyMotion>
  );
};
