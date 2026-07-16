import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

type Props = {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
};

export function Pagination({ page, totalPages, onPrev, onNext }: Props) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm text-slate-600">
      <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-slate-500 shadow-sm ring-1 ring-slate-200">
        Page {page} / {Math.max(totalPages, 1)}
      </span>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" disabled={page <= 1} onClick={onPrev}>
          <ChevronLeft className="h-4 w-4" />
          Prev
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={page >= Math.max(totalPages, 1)}
          onClick={onNext}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
