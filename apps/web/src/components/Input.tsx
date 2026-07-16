import { forwardRef, type InputHTMLAttributes } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
};

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, error, hint, className = '', id, ...rest },
  ref,
) {
  const inputId = id ?? rest.name;
  return (
    <label className="block space-y-1.5" htmlFor={inputId}>
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        ref={ref}
        id={inputId}
        className={`field-base ${
          error ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-100' : 'border-slate-200'
        } ${className}`}
        {...rest}
      />
      <AnimatePresence>
        {error ? (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="text-xs font-medium text-rose-600"
          >
            {error}
          </motion.p>
        ) : hint ? (
          <p className="text-xs text-slate-400">{hint}</p>
        ) : null}
      </AnimatePresence>
    </label>
  );
});
