import { motion, type HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';

type Props = HTMLMotionProps<'button'> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'soft';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: ReactNode;
};

const variants = {
  primary:
    'bg-gradient-to-r from-brand-600 to-indigo-500 text-white shadow-glow hover:from-brand-700 hover:to-indigo-600',
  secondary:
    'bg-white/90 text-slate-800 border border-slate-200 shadow-sm hover:bg-white hover:border-slate-300',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100/80',
  danger: 'bg-rose-600 text-white shadow-sm hover:bg-rose-700',
  soft: 'bg-brand-50 text-brand-700 border border-brand-100 hover:bg-brand-100',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-xl',
  lg: 'px-5 py-3 text-sm rounded-xl',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  children,
  className = '',
  disabled,
  ...rest
}: Props) {
  return (
    <motion.button
      whileHover={disabled || loading ? undefined : { y: -1 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      transition={{ duration: 0.15 }}
      className={`inline-flex items-center justify-center gap-2 font-semibold transition duration-fast focus-ring disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      )}
      {children}
    </motion.button>
  );
}
