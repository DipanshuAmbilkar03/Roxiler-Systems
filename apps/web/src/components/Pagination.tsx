import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../lib/utils';

type Props = {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  onPage?: (page: number) => void;
  totalItems?: number;
};

function pageWindow(page: number, total: number) {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  if (page <= 3) return [1, 2, 3, 4, total];
  if (page >= total - 2) return [1, total - 3, total - 2, total - 1, total];
  return [1, page - 1, page, page + 1, total];
}

export function Pagination({
  page,
  totalPages,
  onPrev,
  onNext,
  onPage,
  totalItems,
}: Props) {
  const total = Math.max(totalPages, 1);
  const pages = pageWindow(page, total);

  return (
    <div className="flex flex-col gap-3 rounded-[var(--radius)] border border-line bg-panel px-3 py-3 shadow-soft sm:flex-row sm:items-center sm:justify-between sm:px-4">
      <div className="flex items-center gap-2 text-sm text-muted">
        <span className="rounded-full border border-line bg-panel-muted px-2.5 py-1 font-mono text-[11px] font-medium text-ink-soft">
          {page} / {total}
        </span>
        {totalItems != null && (
          <span className="font-mono text-[11px] text-muted">{totalItems} records</span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <Button variant="secondary" size="sm" disabled={page <= 1} onClick={onPrev}>
          <ChevronLeft className="h-4 w-4" />
          Prev
        </Button>

        <div className="hidden items-center gap-1 sm:flex">
          {pages.map((p, idx) => {
            const prev = pages[idx - 1];
            const showGap = prev != null && p - prev > 1;
            return (
              <span key={`${p}-${idx}`} className="contents">
                {showGap && <span className="px-1 text-muted">…</span>}
                <button
                  type="button"
                  onClick={() => onPage?.(p)}
                  disabled={!onPage}
                  className={cn(
                    'min-w-8 rounded-lg px-2 py-1.5 font-mono text-xs font-semibold transition',
                    p === page
                      ? 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/30'
                      : 'text-white/50 hover:bg-white/[0.06]',
                    !onPage && 'cursor-default',
                  )}
                >
                  {p}
                </button>
              </span>
            );
          })}
        </div>

        <Button
          variant="secondary"
          size="sm"
          disabled={page >= total}
          onClick={onNext}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
