import { cn } from '../lib/utils';

type Option = {
  value: string;
  label: string;
};

type Props = {
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  className?: string;
  ariaLabel?: string;
};

export function SegmentedControl({
  value,
  options,
  onChange,
  className,
  ariaLabel = 'Options',
}: Props) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        'inline-flex max-w-full flex-wrap rounded-xl border border-white/15 bg-black/30 p-1 shadow-inset backdrop-blur-sm sm:flex-nowrap',
        className,
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              'min-w-0 flex-1 rounded-lg px-2.5 py-2 text-[11px] font-bold transition duration-fast touch-manipulation sm:flex-none sm:px-3.5 sm:py-1.5 sm:text-xs',
              active
                ? 'bg-indigo-500 text-white shadow-soft shadow-indigo-900/40'
                : 'text-white/70 hover:bg-white/10 hover:text-white',
            )}
          >
            <span className="block truncate">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
