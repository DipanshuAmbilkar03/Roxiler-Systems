import type { ReactNode } from 'react';
import { cn } from '../lib/utils';

type Props = {
  children: ReactNode;
  className?: string;
  title?: string;
  actions?: ReactNode;
  /** Tighter layout without heavy header strip */
  compact?: boolean;
};

export function FilterBar({
  children,
  className,
  title = 'Filters',
  actions,
  compact = false,
}: Props) {
  if (compact) {
    return (
      <div
        className={cn(
          'rounded-xl border border-white/[0.10] bg-white/[0.03] p-3 sm:p-3.5',
          className,
        )}
      >
        <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/45">
            {title}
          </p>
          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
        {children}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-white/12 bg-gradient-to-b from-white/[0.07] to-white/[0.03] shadow-card backdrop-blur-md',
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/[0.04] px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.65)]" />
          <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-white/85">
            {title}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-white/75">{actions}</div>
      </div>
      <div className="space-y-3 p-4 sm:p-5">{children}</div>
    </div>
  );
}