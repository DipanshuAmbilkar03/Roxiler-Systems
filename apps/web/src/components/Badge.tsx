import type { ReactNode } from 'react';

const styles = {
  default: 'bg-slate-100 text-slate-700',
  brand: 'bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-100',
  success: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-100',
  warning: 'bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-100',
  danger: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-100',
  info: 'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-100',
};

type Props = {
  children: ReactNode;
  variant?: keyof typeof styles;
  className?: string;
};

export function Badge({ children, variant = 'default', className = '' }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
