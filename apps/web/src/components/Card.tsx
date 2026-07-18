import type { ReactNode } from 'react';
import { cn } from '../lib/utils';

type Props = {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
  padded?: boolean;
};

export function Card({ children, className = '', hover = false, padded = true }: Props) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius)] border border-white/[0.08] bg-white/[0.04] shadow-card backdrop-blur-md',
        padded && 'p-5',
        hover && 'transition duration-base hover:-translate-y-0.5 hover:border-line-strong hover:shadow-soft',
        className,
      )}
    >
      {children}
    </div>
  );
}
