import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

type Props = {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
};

export function EmptyState({ title, description, icon, action }: Props) {
  return (
    <div className="relative overflow-hidden rounded-[var(--radius)] border border-dashed border-white/10 bg-white/[0.03] px-6 py-14 text-center backdrop-blur-md">
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent" />
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04] text-indigo-400 shadow-card">
        {icon ?? <Inbox className="h-5 w-5" />}
      </div>
      <p className="font-display text-lg font-semibold text-ink">{title}</p>
      {description && <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
