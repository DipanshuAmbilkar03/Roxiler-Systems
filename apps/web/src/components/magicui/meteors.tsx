import { useEffect, useState, type CSSProperties } from 'react';
import { cn } from '@/lib/utils';

type MeteorsProps = {
  number?: number;
  minDelay?: number;
  maxDelay?: number;
  minDuration?: number;
  maxDuration?: number;
  angle?: number;
  className?: string;
};

export function Meteors({
  number = 20,
  minDelay = 0.2,
  maxDelay = 1.2,
  minDuration = 2,
  maxDuration = 10,
  angle = 215,
  className,
}: MeteorsProps) {
  const [meteorStyles, setMeteorStyles] = useState<CSSProperties[]>([]);

  useEffect(() => {
    const styles = Array.from({ length: number }, () => ({
      '--angle': `-${angle}deg`,
      top: '-5%',
      left: `calc(0% + ${Math.floor(Math.random() * 100)}%)`,
      animationDelay: `${Math.random() * (maxDelay - minDelay) + minDelay}s`,
      animationDuration: `${Math.floor(
        Math.random() * (maxDuration - minDuration) + minDuration,
      )}s`,
    })) as CSSProperties[];
    setMeteorStyles(styles);
  }, [number, minDelay, maxDelay, minDuration, maxDuration, angle]);

  return (
    <>
      {meteorStyles.map((style, idx) => (
        <span
          key={idx}
          style={style}
          className={cn(
            'pointer-events-none absolute h-0.5 w-0.5 rotate-[var(--angle)] animate-meteor rounded-full bg-amber-200/80 shadow-[0_0_0_1px_#ffffff15]',
            className,
          )}
        >
          <span className="pointer-events-none absolute top-1/2 -z-10 h-px w-[50px] -translate-y-1/2 bg-gradient-to-r from-amber-200/80 to-transparent" />
        </span>
      ))}
    </>
  );
}