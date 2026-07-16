import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { NumberTicker } from './magicui';

type Props = {
  value: number;
  label: string;
  icon?: LucideIcon;
  accent?: 'brand' | 'sky' | 'emerald' | 'amber';
  delay?: number;
};

const accents = {
  brand: {
    icon: 'bg-brand-50 text-brand-600',
    ring: 'from-brand-500/20 to-transparent',
  },
  sky: {
    icon: 'bg-sky-50 text-sky-600',
    ring: 'from-sky-500/20 to-transparent',
  },
  emerald: {
    icon: 'bg-emerald-50 text-emerald-600',
    ring: 'from-emerald-500/20 to-transparent',
  },
  amber: {
    icon: 'bg-amber-50 text-amber-600',
    ring: 'from-amber-500/20 to-transparent',
  },
};

export function AnimatedCounter({
  value,
  label,
  icon: Icon,
  accent = 'brand',
  delay = 0,
}: Props) {
  const theme = accents[accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ y: -3 }}
      className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-card backdrop-blur-sm"
    >
      <div
        className={`pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br ${theme.ring}`}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900">
            <NumberTicker
              value={value}
              delay={delay}
              className="font-display text-3xl font-bold tracking-tight"
            />
          </p>
        </div>
        {Icon && (
          <div className={`rounded-xl p-2.5 ${theme.icon}`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
