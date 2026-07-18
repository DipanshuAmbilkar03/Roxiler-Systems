import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { NumberTicker } from './magicui';
import { cn } from '../lib/utils';

type Props = {
  value: number;
  label: string;
  icon?: LucideIcon;
  accent?: 'brand' | 'sky' | 'emerald' | 'amber';
  delay?: number;
  hint?: string;
  max?: number;
};

const accents = {
  brand: {
    icon: 'bg-indigo-500/25 text-indigo-200 ring-1 ring-indigo-400/30',
    bar: 'from-indigo-500 to-indigo-300',
    glow: 'from-indigo-500/20 via-transparent to-transparent',
  },
  sky: {
    icon: 'bg-cyan-500/25 text-cyan-200 ring-1 ring-cyan-400/30',
    bar: 'from-cyan-500 to-sky-300',
    glow: 'from-cyan-500/20 via-transparent to-transparent',
  },
  emerald: {
    icon: 'bg-emerald-500/25 text-emerald-200 ring-1 ring-emerald-400/30',
    bar: 'from-emerald-500 to-emerald-300',
    glow: 'from-emerald-500/20 via-transparent to-transparent',
  },
  amber: {
    icon: 'bg-amber-500/25 text-amber-200 ring-1 ring-amber-400/30',
    bar: 'from-amber-500 to-orange-300',
    glow: 'from-amber-500/20 via-transparent to-transparent',
  },
};

export function AnimatedCounter({
  value,
  label,
  icon: Icon,
  accent = 'brand',
  delay = 0,
  hint,
  max,
}: Props) {
  const theme = accents[accent];
  const pct =
    max && max > 0 ? Math.max(6, Math.min(100, Math.round((value / max) * 100))) : 42;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay }}
      className="stat-tile"
    >
      <div
        className={cn(
          'pointer-events-none absolute inset-0 bg-gradient-to-br opacity-80',
          theme.glow,
        )}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/70">
            {label}
          </p>
          <p className="mt-3 font-display text-[2.15rem] font-extrabold tracking-tight text-white">
            <NumberTicker
              value={value}
              delay={delay}
              className="font-display text-[2.15rem] font-extrabold tracking-tight text-white"
            />
          </p>
          {hint && <p className="mt-1 text-xs text-white/55">{hint}</p>}
        </div>
        {Icon && (
          <div className={cn('rounded-xl p-2.5', theme.icon)}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      <div className="metric-bar relative mt-5">
        <span
          className={cn('bg-gradient-to-r', theme.bar)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </motion.div>
  );
}
