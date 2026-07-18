import { motion, type HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '../lib/utils';

type Props = HTMLMotionProps<'button'> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'soft';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: ReactNode;
};

const variants = {
  primary:
    'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-900/30 hover:from-indigo-500 hover:to-indigo-400 hover:shadow-indigo-800/35',
  secondary:
    'bg-white/[0.05] text-ink border border-white/[0.08] shadow-soft hover:border-white/15 hover:bg-white/[0.08] backdrop-blur-md',
  ghost: 'bg-transparent text-ink-soft hover:bg-white/5 hover:text-ink',
  danger: 'bg-rose-600 text-white shadow-soft hover:bg-rose-700',
  soft: 'bg-brand-950/60 text-brand-300 border border-brand-800/50 hover:bg-brand-900/40',
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
      whileTap={{ scale: disabled || loading ? 1 : 0.985 }}
      transition={{ duration: 0.14 }}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold tracking-tight transition duration-fast focus-ring disabled:cursor-not-allowed disabled:opacity-55 disabled:shadow-none',
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && (
        <span
          className={cn(
            'h-4 w-4 animate-spin rounded-full border-2 border-white/30',
            variant === 'primary' || variant === 'danger'
              ? 'border-t-white'
              : 'border-t-current border-line-strong/40',
          )}
        />
      )}
      {children}
    </motion.button>
  );
}



