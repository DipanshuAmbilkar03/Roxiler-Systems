import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../lib/utils';

type Props = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  description?: string;
  footer?: ReactNode;
  size?: 'md' | 'lg';
};

export function Modal({
  open,
  title,
  onClose,
  children,
  description,
  footer,
  size = 'md',
}: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-40 flex items-end justify-center bg-black/50 p-0 pb-[env(safe-area-inset-bottom)] backdrop-blur-[2px] sm:items-center sm:p-4 sm:pb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.99 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={cn(
              'flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-[1.25rem] border border-line bg-panel shadow-glow sm:rounded-[var(--radius)]',
              size === 'lg' ? 'max-w-2xl' : 'max-w-lg',
            )}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            <div className="flex items-start justify-between gap-3 border-b border-line bg-panel-muted px-5 py-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Dialog</p>
                <h2 className="mt-1 font-display text-xl font-semibold text-ink">{title}</h2>
                {description && <p className="mt-1 text-sm text-muted">{description}</p>}
              </div>
              <button
                type="button"
                className="rounded-lg border border-line bg-panel p-2 text-muted transition hover:bg-panel hover:text-ink focus-ring"
                onClick={onClose}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="overflow-y-auto px-5 py-5">{children}</div>
            {footer && (
              <div className="border-t border-line bg-panel-muted/80 px-5 py-3">{footer}</div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

