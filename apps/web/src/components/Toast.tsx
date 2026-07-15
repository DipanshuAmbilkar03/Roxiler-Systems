import { AnimatePresence, motion } from 'framer-motion';
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

const colors = {
  success: 'bg-emerald-600',
  error: 'bg-rose-600',
  info: 'bg-slate-800',
};

export function ToastViewport() {
  const items = useToastStore((s) => s.items);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-80 flex-col gap-2">
      <AnimatePresence>
        {items.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className={`pointer-events-auto rounded-token px-4 py-3 text-sm text-white shadow-lg ${colors[t.type]}`}
            role="status"
          >
            <div className="flex items-start justify-between gap-3">
              <span>{t.message}</span>
              <button
                type="button"
                className="opacity-80 hover:opacity-100"
                onClick={() => dismiss(t.id)}
              >
                ×
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function toast(message: string, type?: ToastItem['type']) {
  useToastStore.getState().push(message, type);
}
