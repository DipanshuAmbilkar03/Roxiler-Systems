import type { ReactNode } from 'react';
import { cn } from '../lib/utils';

type Item = {
  label: string;
  value: ReactNode;
  className?: string;
};

type Props = {
  items: Item[];
  columns?: 1 | 2;
  className?: string;
};

export function KeyValueGrid({ items, columns = 2, className }: Props) {
  return (
    <div
      className={cn(
        'grid gap-3',
        columns === 2 ? 'sm:grid-cols-2' : 'grid-cols-1',
        className,
      )}
    >
      {items.map((item) => (
        <div
          key={item.label}
          className={cn(
            'rounded-xl border border-line bg-panel-muted p-3',
            item.className,
          )}
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
            {item.label}
          </p>
          <div className="mt-2 text-sm text-ink">{item.value}</div>
        </div>
      ))}
    </div>
  );
}
