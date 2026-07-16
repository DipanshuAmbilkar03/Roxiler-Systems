import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { create } from 'zustand';

type ToastItem = { id: number; message: string; type: 'success' | 'error' | 'info' };

interface ToastState {
  items: ToastItem[];
  push: (message: string, type?: ToastItem['type']) => void;
  dismiss: (id: number) => void;
}

let seq = 0;

export const useToastStore = create<ToastState>((set) => ({
  items: [],
  push: (message, type = 'info') => {
    const id = ++seq;
    set((s) => ({ items: [...s.items, { id, message, type }] }));
    window.setTimeout(() => {
      set((s) => ({ items: s.items.filter((t) => t.id !== id) }));
    }, 3200);
  },
  dismiss: (id) => set((s) => ({ items: s.items.filter((t) => t.id !== id) })),
}));

const styles = {
  success: {
    bar: 'from-emerald-500 to-teal-400',
    icon: CheckCircle2,
    iconClass: 'text-emerald-600',
  },
  error: {
    bar: 'from-rose-500 to-pink-400',
    icon: XCircle,
    iconClass: 'text-rose-600',
  },
  info: {
    bar: 'from-brand-500 to-sky-400',
    icon: Info,
    iconClass: 'text-brand-600',
  },
};

export function ToastViewport() {
  const items = useToastStore((s) => s.items);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2">
      <AnimatePresence>
        {items.map((t) => {
          const meta = styles[t.type];
          const Icon = meta.icon;
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 14, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.22 }}
              className="pointer-events-auto overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-glow"
              role="status"
            >
              <div className={`h-1 bg-gradient-to-r ${meta.bar}`} />
              <div className="flex items-start gap-3 px-4 py-3">
                <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${meta.iconClass}`} />
                <span className="flex-1 text-sm font-medium text-slate-800">{t.message}</span>
                <button
                  type="button"
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  onClick={() => dismiss(t.id)}
                  aria-label="Dismiss"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export function toast(message: string, type?: ToastItem['type']) {
  useToastStore.getState().push(message, type);
}
