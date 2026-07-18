import { memo, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { EmptyState } from './EmptyState';
import { Skeleton } from './Skeleton';
import { cn } from '../lib/utils';

export type Column<T> = {
  key: string;
  header: string;
  sortable?: boolean;
  className?: string;
  render: (row: T) => ReactNode;
};

type Props<T> = {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  sortBy?: string;
  order?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  loading?: boolean;
  emptyMessage?: string;
  dense?: boolean;
};

function SkeletonRows({ cols, dense }: { cols: number; dense?: boolean }) {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={i}>
          {Array.from({ length: cols }).map((__, j) => (
            <td key={j} className={dense ? 'px-3 py-2.5' : 'px-4 py-3.5'}>
              <Skeleton className="h-3.5 w-full" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function DataTableInner<T>({
  columns,
  rows,
  rowKey,
  sortBy,
  order = 'asc',
  onSort,
  loading,
  emptyMessage = 'No results',
  dense = false,
}: Props<T>) {
  const cellPad = dense ? 'px-3 py-2.5' : 'px-4 py-3.5';

  return (
    <div className="overflow-hidden rounded-[var(--radius)] border border-line bg-panel shadow-card">
      <div className="overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
        <table className="min-w-full text-left text-[13px]">
          <thead className="sticky top-0 z-10 border-b border-line bg-panel-muted text-[10px] uppercase tracking-[0.14em] text-muted">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className={cn(cellPad, 'font-semibold', col.className)}>
                  {col.sortable && onSort ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 rounded-md transition hover:text-ink"
                      onClick={() => onSort(col.key)}
                    >
                      {col.header}
                      {sortBy === col.key ? (
                        order === 'asc' ? (
                          <ArrowUp className="h-3.5 w-3.5 text-brand-300" />
                        ) : (
                          <ArrowDown className="h-3.5 w-3.5 text-brand-300" />
                        )
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 opacity-35" />
                      )}
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line/70">
            {loading ? (
              <SkeletonRows cols={columns.length} dense={dense} />
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-4">
                  <EmptyState title={emptyMessage} description="Try adjusting filters or search." />
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => (
                <tr
                  key={rowKey(row)}
                  className={cn(
                    'group transition-colors duration-fast hover:bg-white/[0.04]',
                    idx % 2 === 1 && 'bg-white/[0.02]',
                  )}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={cn(cellPad, 'text-ink-soft', col.className)}>
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export const DataTable = memo(DataTableInner) as typeof DataTableInner;

