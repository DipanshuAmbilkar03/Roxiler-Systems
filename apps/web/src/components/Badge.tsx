import type { ReactNode } from 'react';
import { cn } from '../lib/utils';

const styles = {
  default: 'bg-white/[0.06] text-white/70 ring-1 ring-inset ring-white/10',
  brand: 'bg-indigo-500/15 text-indigo-300 ring-1 ring-inset ring-indigo-500/25',
  success: 'bg-emerald-500/15 text-emerald-300 ring-1 ring-inset ring-emerald-500/25',
  warning: 'bg-amber-500/15 text-amber-300 ring-1 ring-inset ring-amber-500/25',
  danger: 'bg-rose-500/15 text-rose-300 ring-1 ring-inset ring-rose-500/25',
  info: 'bg-cyan-500/15 text-cyan-300 ring-1 ring-inset ring-cyan-500/25',
};

type Props = {
  children: ReactNode;
  variant?: keyof typeof styles;
  className?: string;
};

export function Badge({ children, variant = 'default', className = '' }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide',
        styles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
