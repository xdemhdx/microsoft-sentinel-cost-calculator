import { Funnel, ShieldAlert } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { CostSummary, Source, Tier } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface ArchitectureDiagramProps {
  selected: Array<{ source: Source; split: Record<Tier, number> }>;
  summary: CostSummary;
}

const tierMeta = {
  analytics: { label: 'Analytics Tier', price: '$4.30/GB', color: 'text-amber-300', border: 'border-amber-500/25', bg: 'bg-amber-500/[0.06]', bar: 'bg-nox-warn' },
  datalake: { label: 'Data Lake (Auxiliary)', price: '$0.15/GB', color: 'text-violet-300', border: 'border-violet-500/25', bg: 'bg-violet-500/[0.06]', bar: 'bg-nox-lilac' },
  basic: { label: 'Basic Logs', price: '$1.00/GB', color: 'text-indigo-300', border: 'border-indigo-500/25', bg: 'bg-indigo-500/[0.06]', bar: 'bg-nox-blue' },
} as const;

export function ArchitectureDiagram({ selected, summary }: ArchitectureDiagramProps) {
  const [sourceScrollTop, setSourceScrollTop] = useState(0);
  const tierTotals = {
    analytics: summary.tierDaily.analytics,
    datalake: summary.tierDaily.datalake,
    basic: summary.tierDaily.basic,
  };

  const rowHeight = 66;
  const visibleRowCount = 6;
  const sourcePanelHeight = Math.max(420, Math.min(selected.length, visibleRowCount) * rowHeight + 24);
  const visibleStartIndex = Math.min(
    Math.max(0, Math.floor(sourceScrollTop / rowHeight)),
    Math.max(0, selected.length - visibleRowCount),
  );
  const visibleSlice = useMemo(
    () => selected.slice(visibleStartIndex, visibleStartIndex + visibleRowCount),
    [selected, visibleStartIndex],
  );

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-[10px] border border-nox-accent/25 bg-nox-accent/10">
            <Funnel className="h-[18px] w-[18px] text-nox-accent" />
          </div>
          <div>
            <CardTitle className="text-xl tracking-[-0.02em]">Sentinel Data Architecture</CardTitle>
            <p className="font-mono text-xs text-nox-muted">{summary.dailyIngestion.toFixed(2)} GB/day across {selected.length} sources</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.07] p-4">
            <p className="text-sm text-amber-300">Analytics Tier</p>
            <p className="text-3xl font-semibold tabular-nums tracking-[-0.03em] text-amber-200">{tierTotals.analytics.toFixed(2)} <span className="font-mono text-xs font-medium tracking-normal opacity-70">GB/day</span></p>
          </div>
          <div className="rounded-xl border border-violet-500/30 bg-violet-500/[0.07] p-4">
            <p className="text-sm text-violet-300">Data Lake</p>
            <p className="text-3xl font-semibold tabular-nums tracking-[-0.03em] text-violet-200">{tierTotals.datalake.toFixed(2)} <span className="font-mono text-xs font-medium tracking-normal opacity-70">GB/day</span></p>
          </div>
          <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/[0.07] p-4">
            <p className="text-sm text-indigo-300">Basic Logs</p>
            <p className="text-3xl font-semibold tabular-nums tracking-[-0.03em] text-indigo-200">{tierTotals.basic.toFixed(2)} <span className="font-mono text-xs font-medium tracking-normal opacity-70">GB/day</span></p>
          </div>
          <div className="rounded-xl border border-red-500/30 bg-red-500/[0.07] p-4">
            <p className="text-sm text-red-300">FREE Ingestion</p>
            <p className="text-3xl font-semibold tabular-nums tracking-[-0.03em] text-red-200">{summary.freeGrantDailyGb.toFixed(2)} <span className="font-mono text-xs font-medium tracking-normal opacity-70">GB/day</span></p>
          </div>
        </div>

        <div className="relative grid gap-4 xl:grid-cols-[320px_360px_1fr]">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-slate-200">Log Sources</p>
              {selected.length > visibleRowCount ? (
                <p className="text-xs text-slate-500">
                  Showing {visibleStartIndex + 1}-{Math.min(selected.length, visibleStartIndex + visibleSlice.length)} of {selected.length}
                </p>
              ) : null}
            </div>
            {selected.length === 0 ? <p className="text-sm text-slate-400">No selected sources yet.</p> : null}
            <div
              className="space-y-2 overflow-y-auto pr-2"
              style={{ maxHeight: `${sourcePanelHeight}px` }}
              onScroll={(e) => setSourceScrollTop(e.currentTarget.scrollTop)}
            >
            {selected.map((item) => (
              <div key={item.source.id} className="rounded-lg border border-white/[0.08] bg-nox-panel px-3 py-2">
                <p className="truncate text-sm font-medium text-slate-100">{item.source.product}</p>
                <p className="text-xs text-slate-400">{item.source.base_ingestion.toFixed(2)} GB/day</p>
                <div className="mt-2 h-1 rounded bg-slate-800">
                  <div className="h-1 rounded bg-nox-accent" style={{ width: `${Math.min(100, item.source.base_ingestion * 20)}%` }} />
                </div>
              </div>
            ))}
            </div>
          </div>

          <div className="relative flex items-center justify-center py-2">
            <div className="w-full rounded-xl border border-dashed border-white/[0.1] bg-[radial-gradient(circle_at_50%_50%,rgba(61,255,162,0.06),transparent_60%)] p-6" style={{ minHeight: `${sourcePanelHeight}px` }}>
              <div className="relative z-20 mx-auto mt-24 w-48 rounded-xl border border-nox-accent/35 bg-nox-surface p-4 text-center shadow-[0_0_0_1px_rgba(61,255,162,0.06),0_0_60px_-20px_rgba(61,255,162,0.55)]">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-[10px] bg-nox-accent">
                  <Funnel className="h-6 w-6 text-nox-ink" />
                </div>
                <p className="font-mono text-xs text-nox-accent">DCR</p>
                <p className="text-lg font-semibold tracking-[-0.01em] text-nox-text">Transformation</p>
                <p className="mt-1 text-xs text-nox-muted">Data Collection Rules</p>
              </div>
            </div>

            <svg className="pointer-events-none absolute inset-0 z-0 hidden xl:block" viewBox={`0 0 360 ${sourcePanelHeight}`} fill="none" preserveAspectRatio="none">
              {visibleSlice.map((item, index) => {
                const y = 52 + index * 66;
                const endY = sourcePanelHeight / 2;
                const endX = 78;
                return (
                  <g key={item.source.id}>
                    <path
                      d={`M 0 ${y} C 56 ${y}, 62 ${endY}, ${endX} ${endY}`}
                      className="flow-path"
                    />
                    <circle r="3" fill="#3dffa2" className="flow-dot">
                      <animateMotion dur="2.5s" repeatCount="indefinite" rotate="auto" path={`M 0 ${y} C 56 ${y}, 62 ${endY}, ${endX} ${endY}`} />
                    </circle>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-200">Sentinel Tiers</p>
            {(['analytics', 'datalake', 'basic'] as const).map((tier) => (
              <div key={tier} className={`rounded-xl border p-4 ${tierMeta[tier].border} ${tierMeta[tier].bg}`}>
                <div className="mb-2 flex items-center justify-between">
                  <p className={`text-lg font-semibold ${tierMeta[tier].color}`}>{tierMeta[tier].label}</p>
                  <p className={`text-xl font-semibold ${tierMeta[tier].color}`}>{tierTotals[tier].toFixed(2)} <span className="text-sm">GB/day</span></p>
                </div>
                <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <div className={`h-1.5 rounded-full ${tierMeta[tier].bar}`} style={{ width: `${summary.dailyIngestion ? Math.min(100, (tierTotals[tier] / summary.dailyIngestion) * 100) : 0}%` }} />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{tierMeta[tier].price}</span>
                  <span>{summary.dailyIngestion ? Math.round((tierTotals[tier] / summary.dailyIngestion) * 100) : 0}%</span>
                </div>
              </div>
            ))}

            <div className="rounded-lg border border-white/[0.08] bg-nox-panel p-3 text-xs text-nox-muted">
              <div className="mb-2 flex items-center gap-2 text-slate-300"><ShieldAlert className="h-4 w-4 text-nox-accent" />Routing Notes</div>
              <p>Adjust source splits below to simulate DCR transformations and optimize ingestion cost across tiers.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

