import { motion } from 'framer-motion';
import { MapPin, ChevronRight, Star } from 'lucide-react';
import { Badge } from './Badge';
import { StarRating } from './StarRating';
import { cn } from '../lib/utils';

/** Theme-aligned cover accents: indigo brand + cyan accent (site palette) */
const covers = [
  {
    base: 'from-indigo-700 via-indigo-800 to-[#1e1b4b]',
    accent: 'text-indigo-300',
    chip: 'border-indigo-400/25 bg-[#0b0b1f]/90 text-indigo-50',
    cta: 'from-indigo-500/15 to-violet-500/10 group-hover:border-indigo-400/40',
  },
  {
    base: 'from-indigo-600 via-violet-700 to-indigo-900',
    accent: 'text-violet-300',
    chip: 'border-violet-400/25 bg-[#0b0b1f]/90 text-violet-50',
    cta: 'from-violet-500/15 to-indigo-500/10 group-hover:border-violet-400/40',
  },
  {
    base: 'from-cyan-700 via-indigo-700 to-[#0f172a]',
    accent: 'text-cyan-300',
    chip: 'border-cyan-400/25 bg-[#0b0b1f]/90 text-cyan-50',
    cta: 'from-cyan-500/15 to-indigo-500/10 group-hover:border-cyan-400/40',
  },
  {
    base: 'from-[#312e81] via-indigo-800 to-slate-900',
    accent: 'text-indigo-200',
    chip: 'border-indigo-300/20 bg-[#0b0b1f]/90 text-indigo-50',
    cta: 'from-indigo-500/12 to-cyan-500/8 group-hover:border-indigo-400/35',
  },
  {
    base: 'from-violet-700 via-indigo-800 to-[#050510]',
    accent: 'text-indigo-300',
    chip: 'border-indigo-400/20 bg-[#0b0b1f]/90 text-white',
    cta: 'from-indigo-500/15 to-violet-500/10 group-hover:border-indigo-400/40',
  },
  {
    base: 'from-slate-800 via-indigo-900 to-[#07071a]',
    accent: 'text-indigo-300',
    chip: 'border-white/15 bg-[#0b0b1f]/90 text-white',
    cta: 'from-white/[0.06] to-indigo-500/10 group-hover:border-indigo-400/30',
  },
];

function coverFor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return covers[hash % covers.length];
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

type Props = {
  id: string;
  name: string;
  address: string;
  averageRating?: number | null;
  ratingsCount?: number;
  userRating?: number | null;
  onOpen?: () => void;
  className?: string;
  index?: number;
};

export function StoreCard({
  id,
  name,
  address,
  averageRating,
  ratingsCount,
  userRating,
  onOpen,
  className,
  index = 0,
}: Props) {
  const cover = coverFor(id || name);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, delay: Math.min(index * 0.04, 0.24), ease: 'easeOut' }}
      whileHover={{ y: -2 }}
      className={cn('h-full', className)}
    >
      <article
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onOpen?.();
          }
        }}
        className={cn(
          'group flex h-full cursor-pointer flex-col overflow-hidden rounded-xl text-left',
          'border border-white/[0.10] bg-white/[0.04] shadow-card backdrop-blur-md',
          'transition duration-200 hover:border-indigo-400/30 hover:bg-white/[0.06]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050510]',
        )}
      >
        {/* Compact cover with a light bottom fade only */}
        <div className={cn('relative h-24 overflow-hidden bg-gradient-to-br', cover.base)}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(129,140,248,0.18),transparent_48%)]" />
          {/* soft fade into card body */}
          <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#0a0a16]/55 to-transparent" />

          <div className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg border border-indigo-300/25 bg-indigo-500/15 font-display text-xs font-semibold text-white">
            {initials(name) || 'S'}
          </div>

          <div className="absolute right-3 top-3">
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold backdrop-blur-sm',
                cover.chip,
              )}
            >
              <Star className="h-2.5 w-2.5 fill-amber-300 text-amber-300" />
              {averageRating != null ? Number(averageRating).toFixed(1) : 'New'}
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-2.5 p-3.5">
          <h3 className="font-display text-[0.98rem] font-bold leading-snug tracking-tight text-white line-clamp-1">
            {name}
          </h3>

          <div className="flex items-start gap-1.5 text-[13px] text-ink-soft">
            <MapPin className={cn('mt-0.5 h-3.5 w-3.5 shrink-0', cover.accent)} />
            <p className="line-clamp-2 leading-relaxed text-white/65">{address}</p>
          </div>

          <div className="mt-auto space-y-2.5 border-t border-white/[0.08] pt-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted">
                  Overall rating
                </p>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <StarRating value={averageRating ?? 0} readOnly size="sm" />
                  <span className="truncate text-[10px] text-muted">
                    {ratingsCount != null
                      ? `${ratingsCount} review${ratingsCount === 1 ? '' : 's'}`
                      : 'No reviews yet'}
                  </span>
                </div>
              </div>
              {userRating != null ? (
                <Badge variant="brand">You: {userRating}/5</Badge>
              ) : (
                <Badge variant="info">Rate it</Badge>
              )}
            </div>

            <div
              className={cn(
                'flex items-center justify-between rounded-lg border border-white/[0.08] bg-gradient-to-r px-2.5 py-2 text-[13px] font-semibold text-indigo-100 transition',
                cover.cta,
              )}
            >
              <span>Open details and rate</span>
              <ChevronRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </div>
          </div>
        </div>
      </article>
    </motion.div>
  );
}
