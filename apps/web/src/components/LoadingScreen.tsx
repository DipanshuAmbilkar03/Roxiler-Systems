import { Star } from 'lucide-react';

export function LoadingScreen({ label = 'Loading workspace' }: { label?: string }) {
  return (
    <div className="grid min-h-[50vh] place-items-center px-4">
      <div className="flex w-full max-w-sm flex-col items-center rounded-[1.25rem] border border-line bg-panel px-6 py-8 shadow-card">
        <div className="relative mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-ink text-sky-300">
          <Star className="h-5 w-5 fill-current" />
          <span className="absolute -inset-1 animate-ping rounded-2xl border border-brand-400/30" />
        </div>
        <p className="font-display text-lg font-semibold text-ink">Roxiler System</p>
        <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">{label}</p>
        <div className="mt-5 h-1 w-28 overflow-hidden rounded-full bg-panel-muted">
          <div className="h-full w-1/2 animate-shimmer rounded-full bg-gradient-to-r from-transparent via-brand-500 to-transparent bg-[length:200%_100%]" />
        </div>
      </div>
    </div>
  );
}
