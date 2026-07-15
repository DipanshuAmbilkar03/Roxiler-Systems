import { motion } from 'framer-motion';
import { memo, useState } from 'react';

type Props = {
  value: number | null;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
};

const sizes = { sm: 'text-base', md: 'text-xl', lg: 'text-3xl' };

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
      className={`inline-flex items-center gap-0.5 ${sizes[size]}`}
      onMouseLeave={() => setHover(null)}
      role={readOnly ? 'img' : 'radiogroup'}
      aria-label={value ? `Rating ${value} of 5` : 'No rating'}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= display;
        return (
          <motion.button
            key={star}
            type="button"
            disabled={readOnly || !onChange}
            whileHover={readOnly ? undefined : { scale: 1.15 }}
            whileTap={readOnly ? undefined : { scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`leading-none ${
              active ? 'text-amber-400' : 'text-slate-300'
            } ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
            onMouseEnter={() => !readOnly && setHover(star)}
            onClick={() => onChange?.(star)}
            aria-label={`${star} star`}
          >
            ★
          </motion.button>
        );
      })}
    </div>
  );
});
