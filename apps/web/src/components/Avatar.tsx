import { cn } from '../lib/utils';

const tones = [
  'bg-gradient-to-br from-indigo-600 to-violet-600 text-white',
  'bg-gradient-to-br from-cyan-600 to-blue-600 text-white',
  'bg-gradient-to-br from-emerald-600 to-teal-600 text-white',
  'bg-gradient-to-br from-amber-600 to-orange-600 text-white',
  'bg-gradient-to-br from-fuchsia-600 to-rose-600 text-white',
  'bg-gradient-to-br from-violet-600 to-indigo-600 text-white',
];

function hashSeed(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h;
}

export function initialsFromName(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

type Props = {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const sizes = {
  sm: 'h-8 w-8 text-[10px]',
  md: 'h-9 w-9 text-[11px]',
  lg: 'h-11 w-11 text-sm',
};

export function Avatar({ name, size = 'md', className }: Props) {
  const tone = tones[hashSeed(name || '?') % tones.length];
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-mono font-semibold tracking-tight',
        tone,
        sizes[size],
        className,
      )}
      aria-hidden="true"
    >
      {initialsFromName(name) || '?'}
    </span>
  );
}
