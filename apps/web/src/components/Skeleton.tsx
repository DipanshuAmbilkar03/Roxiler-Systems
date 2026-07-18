import { cn } from '../lib/utils';

type Props = {
  className?: string;
  variant?: 'line' | 'card' | 'store';
};

export function Skeleton({ className = '', variant = 'line' }: Props) {
  if (variant === 'store') {
    return (
      <div
        className={cn(
          'overflow-hidden rounded-[1.2rem] border border-line bg-panel shadow-card',
          className,
        )}
      >
        <div className="h-40 animate-pulse bg-gradient-to-br from-slate-700 via-slate-600 to-slate-700" />
        <div className="space-y-3 p-4">
          <div className="h-3 w-3/4 animate-pulse rounded bg-slate-600/50" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-slate-700/60" />
          <div className="mt-4 h-16 animate-pulse rounded-xl bg-slate-700/60" />
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div
        className={cn(
          'animate-pulse rounded-[var(--radius)] border border-line bg-panel p-5 shadow-card',
          className,
        )}
      >
        <div className="h-3 w-24 rounded bg-slate-600/50" />
        <div className="mt-4 h-8 w-28 rounded bg-slate-700/60" />
        <div className="mt-6 h-1.5 w-full rounded-full bg-slate-700/60" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 bg-[length:200%_100%]',
        className,
      )}
    />
  );
}

