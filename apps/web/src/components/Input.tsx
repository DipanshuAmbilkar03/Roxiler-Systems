import { forwardRef, type InputHTMLAttributes } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, error, className = '', id, ...rest },
  ref,
) {
  const inputId = id ?? rest.name;
  return (
    <label className="block space-y-1.5" htmlFor={inputId}>
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        ref={ref}
        id={inputId}
        className={`w-full rounded-token border bg-white px-3 py-2 text-sm outline-none transition duration-fast focus:ring-2 focus:ring-brand-200 ${
          error ? 'border-rose-400' : 'border-slate-200 focus:border-brand-400'
        } ${className}`}
        {...rest}
      />
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="text-xs text-rose-600"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </label>
  );
});
