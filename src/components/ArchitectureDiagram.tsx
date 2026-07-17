import { Funnel, ShieldAlert } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { CostSummary, Source, Tier } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface ArchitectureDiagramProps {
  selected: Array<{ source: Source; split: Record<Tier, number> }>;
  summary: CostSummary;
}

const tierMeta = {
  analytics: { label: 'Analytics Tier', price: '$4.30/GB', color: 'text-amber-300', border: 'border-amber-500/25', bg: 'bg-amber-500/8' },
  datalake: { label: 'Data Lake (Auxiliary)', price: '$0.15/GB', color: 'text-emerald-300', border: 'border-emerald-500/25', bg: 'bg-emerald-500/8' },
  basic: { label: 'Basic Logs', price: '$1.00/GB', color: 'text-indigo-300', border: 'border-indigo-500/25', bg: 'bg-indigo-500/8' },
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
          <div className="rounded-xl bg-gradient-to-br from-red-500 to-rose-600 p-3 shadow-[0_0_30px_-10px_rgba(239,68,68,0.9)]">
            <Funnel className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl">Sentinel Data Architecture</CardTitle>
            <p className="text-sm text-slate-400">{summary.dailyIngestion.toFixed(2)} GB/day across {selected.length} sources</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
            <p className="text-sm text-amber-300">Analytics Tier</p>
            <p className="text-3xl font-semibold text-amber-200">{tierTotals.analytics.toFixed(2)} <span className="text-base">GB/day</span></p>
          </div>
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
            <p className="text-sm text-emerald-300">Data Lake</p>
            <p className="text-3xl font-semibold text-emerald-200">{tierTotals.datalake.toFixed(2)} <span className="text-base">GB/day</span></p>
          </div>
          <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-4">
            <p className="text-sm text-indigo-300">Basic Logs</p>
            <p className="text-3xl font-semibold text-indigo-200">{tierTotals.basic.toFixed(2)} <span className="text-base">GB/day</span></p>
          </div>
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
            <p className="text-sm text-red-300">FREE Ingestion</p>
            <p className="text-3xl font-semibold text-red-200">{summary.freeGrantDailyGb.toFixed(2)} <span className="text-base">GB/day</span></p>
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
              <div key={item.source.id} className="rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2">
                <p className="truncate text-sm font-medium text-slate-100">{item.source.product}</p>
                <p className="text-xs text-slate-400">{item.source.base_ingestion.toFixed(2)} GB/day</p>
                <div className="mt-2 h-1 rounded bg-slate-800">
                  <div className="h-1 rounded bg-amber-400" style={{ width: `${Math.min(100, item.source.base_ingestion * 20)}%` }} />
                </div>
              </div>
            ))}
            </div>
          </div>

          <div className="relative flex items-center justify-center py-2">
            <div className="w-full rounded-2xl border border-red-500/20 bg-gradient-to-b from-red-500/5 to-slate-900/10 p-6" style={{ minHeight: `${sourcePanelHeight}px` }}>
              <div className="relative z-20 mx-auto mt-24 w-48 rounded-2xl border border-red-400/35 bg-gradient-to-b from-red-500/25 to-red-900/20 p-4 text-center shadow-[0_0_40px_-16px_rgba(239,68,68,0.8)]">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-400 to-rose-600">
                  <Funnel className="h-6 w-6 text-white" />
                </div>
                <p className="text-xl font-semibold text-white">DCR</p>
                <p className="text-lg font-semibold text-white">Transformation</p>
                <p className="mt-1 text-xs text-slate-300">Data Collection Rules</p>
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
                    <circle r="3" fill="#f87171" className="flow-dot">
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
                <div className="mb-2 h-2 rounded-full bg-slate-800">
                  <div className="h-2 rounded-full bg-gradient-to-r from-red-500 to-rose-500" style={{ width: `${summary.dailyIngestion ? Math.min(100, (tierTotals[tier] / summary.dailyIngestion) * 100) : 0}%` }} />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{tierMeta[tier].price}</span>
                  <span>{summary.dailyIngestion ? Math.round((tierTotals[tier] / summary.dailyIngestion) * 100) : 0}%</span>
                </div>
              </div>
            ))}

            <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-3 text-xs text-slate-400">
              <div className="mb-2 flex items-center gap-2 text-slate-300"><ShieldAlert className="h-4 w-4 text-red-300" />Routing Notes</div>
              <p>Adjust source splits below to simulate DCR transformations and optimize ingestion cost across tiers.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

