import { Star } from 'lucide-react';
import { memo, useState } from 'react';
import { cn } from '../lib/utils';

type Props = {
  value: number | null;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
};

const sizes = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-7 w-7',
};

export const StarRating = memo(function StarRating({
  value,
  onChange,
  readOnly,
  size = 'md',
}: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const display = hover ?? value ?? 0;

  return (
    <div
      className="inline-flex items-center gap-0.5"
      onMouseLeave={() => setHover(null)}
      role={readOnly ? 'img' : 'radiogroup'}
      aria-label={value ? `Rating ${value} of 5` : 'No rating'}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= display;
        return (
          <button
            key={star}
            type="button"
            disabled={readOnly || !onChange}
            className={cn(
              'rounded-md p-0.5 transition duration-fast focus-ring',
              readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110 active:scale-95',
            )}
            onMouseEnter={() => !readOnly && setHover(star)}
            onClick={() => onChange?.(star)}
            aria-label={`${star} star`}
          >
            <Star
              className={cn(
                sizes[size],
                active
                  ? 'fill-amber-400 text-amber-500'
                  : 'fill-transparent text-zinc-500',
              )}
            />
          </button>
        );
      })}
    </div>
  );
});
