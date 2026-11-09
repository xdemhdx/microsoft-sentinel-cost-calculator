import type { ReactNode } from 'react';
import { cn } from '../lib/utils';

interface CostSummaryCardProps {
  title: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
  accent?: boolean;
}

export function CostSummaryCard({ title, value, hint, icon, accent }: CostSummaryCardProps) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border bg-nox-panel px-4 py-4 transition hover:border-white/[0.14]',
        accent ? 'border-nox-accent/30' : 'border-white/[0.08]',
      )}
    >
      {accent ? (
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(61,255,162,0.16),transparent_65%)]" />
      ) : null}
      <div className="flex items-center justify-between gap-3">
        <span className="nox-label text-[10.5px] text-nox-faint">{title}</span>
        <span className="text-nox-faint transition group-hover:text-nox-accent">{icon}</span>
      </div>
      <p className={cn('mt-2 text-[28px] font-semibold tabular-nums tracking-[-0.03em]', accent && 'text-nox-accent')}>{value}</p>
      {hint ? <p className="mt-0.5 font-mono text-[11px] text-nox-faint">{hint}</p> : null}
    </div>
  );
}
