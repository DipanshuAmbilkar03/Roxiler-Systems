import {
  forwardRef,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../lib/utils';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  /** Show an eye toggle for password fields. Defaults to true when type is password. */
  showPasswordToggle?: boolean;
};

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  {
    label,
    error,
    hint,
    icon,
    className = '',
    id,
    type = 'text',
    showPasswordToggle,
    ...rest
  },
  ref,
) {
  const inputId = id ?? rest.name;
  const isPassword = type === 'password';
  const canToggle = isPassword && (showPasswordToggle ?? true);
  const [visible, setVisible] = useState(false);
  const resolvedType = canToggle && visible ? 'text' : type;

  return (
    <label className="block space-y-1.5" htmlFor={inputId}>
      <span className="text-[12px] font-bold tracking-tight text-white/90">{label}</span>
      <span className="field-shell block">
        {icon && <span className="field-icon">{icon}</span>}
        <input
          ref={ref}
          id={inputId}
          type={resolvedType}
          className={cn(
            'field-base',
            icon && 'has-icon',
            canToggle && 'has-toggle',
            error
              ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-800/50'
              : 'border-white/15',
            className,
          )}
          {...rest}
        />
        {canToggle ? (
          <button
            type="button"
            className="field-toggle"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        ) : null}
      </span>
      <AnimatePresence>
        {error ? (
          <motion.p
            initial={{ opacity: 0, y: -3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            transition={{ duration: 0.14 }}
            className="text-xs font-medium text-rose-400"
          >
            {error}
          </motion.p>
        ) : hint ? (
          <p className="text-xs text-white/55">{hint}</p>
        ) : null}
      </AnimatePresence>
    </label>
  );
});
