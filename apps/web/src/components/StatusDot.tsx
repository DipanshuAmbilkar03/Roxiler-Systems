import { cn } from '../lib/utils';

type Props = {
  tone?: 'success' | 'warning' | 'danger' | 'neutral' | 'brand';
  pulse?: boolean;
  className?: string;
  label?: string;
};

const tones = {
  success: 'bg-emerald-400',
  warning: 'bg-amber-400',
  danger: 'bg-rose-400',
  neutral: 'bg-white/40',
  brand: 'bg-indigo-400',
};

export function StatusDot({ tone = 'neutral', pulse = false, className, label }: Props) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span className="relative flex h-2 w-2">
        {pulse && (
          <span
            className={cn(
              'absolute inline-flex h-full w-full animate-ping rounded-full opacity-60',
              tones[tone],
            )}
          />
        )}
        <span className={cn('relative inline-flex h-2 w-2 rounded-full', tones[tone])} />
      </span>
      {label && <span className="text-xs font-medium text-ink-soft">{label}</span>}
    </span>
  );
}
