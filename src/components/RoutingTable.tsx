import { Fragment, useMemo, useState } from 'react';
import { ArrowDownWideNarrow, ChevronDown, Search, X } from 'lucide-react';
import type { Source, Tier } from '../types';
import { cn } from '../lib/utils';
import { Card } from './ui/card';
import { Input } from './ui/input';

export interface RoutedSource {
  source: Source;
  split: Record<Tier, number>;
  dailyGb: number;
}

interface RoutingTableProps {
  rows: RoutedSource[];
  onSplit: (sourceId: string, split: Record<Tier, number>) => void;
}

const TIERS: Tier[] = ['analytics', 'basic', 'datalake'];

const tierMeta: Record<Tier, { label: string; short: string; hex: string; bar: string; text: string; chipOn: string }> = {
  analytics: { label: 'Analytics', short: 'A', hex: '#ffb547', bar: 'bg-nox-warn', text: 'text-nox-warn', chipOn: 'border-nox-warn/50 bg-nox-warn/15 text-nox-warn' },
  basic: { label: 'Basic', short: 'B', hex: '#7fb8ff', bar: 'bg-nox-blue', text: 'text-nox-blue', chipOn: 'border-nox-blue/50 bg-nox-blue/15 text-nox-blue' },
  datalake: { label: 'Data Lake', short: 'L', hex: '#b49cff', bar: 'bg-nox-lilac', text: 'text-nox-lilac', chipOn: 'border-nox-lilac/50 bg-nox-lilac/15 text-nox-lilac' },
};

type Filter = 'all' | Tier | 'custom';
type Sort = 'volume' | 'name';

const pct = (v: number) => Math.round(v * 100);

/** Normalise any stored split so it always sums to 1 (older data may not). */
const normalise = (split: Record<Tier, number>): Record<Tier, number> => {
  const total = split.analytics + split.basic + split.datalake;
  if (total <= 0) return { analytics: 1, basic: 0, datalake: 0 };
  return { analytics: split.analytics / total, basic: split.basic / total, datalake: split.datalake / total };
};

/** Which single tier a split routes to, or null when it's a custom mix. */
const singleTier = (split: Record<Tier, number>): Tier | null => TIERS.find((t) => pct(split[t]) === 100) ?? null;

const presetSplit = (tier: Tier): Record<Tier, number> => ({
  analytics: tier === 'analytics' ? 1 : 0,
  basic: tier === 'basic' ? 1 : 0,
  datalake: tier === 'datalake' ? 1 : 0,
});

/**
 * Set one tier to `value` (0..1) and rebalance the other two so the split
 * still sums to 100%, keeping their relative proportions where possible.
 */
const rebalance = (split: Record<Tier, number>, tier: Tier, value: number): Record<Tier, number> => {
  const v = Math.max(0, Math.min(100, Math.round(value * 100)));
  const others = TIERS.filter((t) => t !== tier);
  const remaining = 100 - v;
  const [o1, o2] = others;
  const a = pct(split[o1]);
  const b = pct(split[o2]);
  let n1: number;
  if (a + b === 0) {
    n1 = remaining; // nothing to preserve: give the rest to the first other tier
  } else {
    n1 = Math.round((remaining * a) / (a + b));
  }
  const n2 = remaining - n1;
  return { [tier]: v / 100, [o1]: n1 / 100, [o2]: n2 / 100 } as Record<Tier, number>;
};

function SplitBar({ split }: { split: Record<Tier, number> }) {
  return (
    <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
      {TIERS.map((t) => (split[t] > 0 ? <div key={t} className={tierMeta[t].bar} style={{ width: `${split[t] * 100}%` }} /> : null))}
    </div>
  );
}

function TierChips({ active, onPick, size = 'sm' }: { active: Tier | null; onPick: (t: Tier) => void; size?: 'sm' | 'md' }) {
  return (
    <div className="flex gap-1">
      {TIERS.map((t) => (
        <button
          key={t}
          type="button"
          title={`Route all to ${tierMeta[t].label}`}
          aria-pressed={active === t}
          onClick={() => onPick(t)}
          className={cn(
            'rounded-md border font-mono font-medium transition',
            size === 'sm' ? 'h-7 w-7 text-[11px]' : 'h-8 px-3 text-xs',
            active === t ? tierMeta[t].chipOn : 'border-white/[0.1] text-nox-faint hover:border-white/20 hover:text-nox-text',
          )}
        >
          {size === 'sm' ? tierMeta[t].short : tierMeta[t].label}
        </button>
      ))}
    </div>
  );
}

export function RoutingTable({ rows, onSplit }: RoutingTableProps) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<Sort>('volume');
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<string | null>(null);

  const normalised = useMemo(() => rows.map((r) => ({ ...r, split: normalise(r.split) })), [rows]);

  const totals = useMemo(() => {
    const t = { analytics: 0, basic: 0, datalake: 0, all: 0 };
    normalised.forEach((r) => {
      TIERS.forEach((tier) => (t[tier] += r.dailyGb * r.split[tier]));
      t.all += r.dailyGb;
    });
    return t;
  }, [normalised]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return normalised
      .filter((r) => {
        if (q && !`${r.source.vendor} ${r.source.product} ${r.source.category}`.toLowerCase().includes(q)) return false;
        if (filter === 'all') return true;
        const single = singleTier(r.split);
        return filter === 'custom' ? single === null : single === filter;
      })
      .sort((a, b) =>
        sort === 'volume' ? b.dailyGb - a.dailyGb || a.source.product.localeCompare(b.source.product) : a.source.product.localeCompare(b.source.product),
      );
  }, [normalised, query, filter, sort]);

  const filterCounts = useMemo(() => {
    const c: Record<Filter, number> = { all: normalised.length, analytics: 0, basic: 0, datalake: 0, custom: 0 };
    normalised.forEach((r) => {
      const s = singleTier(r.split);
      c[s ?? 'custom'] += 1;
    });
    return c;
  }, [normalised]);

  // Drop selections that are no longer in the source list
  const checkedIds = [...checked].filter((id) => normalised.some((r) => r.source.id === id));
  const visibleIds = visible.map((r) => r.source.id);
  const allVisibleChecked = visibleIds.length > 0 && visibleIds.every((id) => checked.has(id));

  const toggleOne = (id: string) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAllVisible = () =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (allVisibleChecked) visibleIds.forEach((id) => next.delete(id));
      else visibleIds.forEach((id) => next.add(id));
      return next;
    });

  const bulkRoute = (tier: Tier) => {
    checkedIds.forEach((id) => onSplit(id, presetSplit(tier)));
    setChecked(new Set());
  };

  if (rows.length === 0) {
    return (
      <Card className="px-6 py-10 text-center">
        <p className="text-sm text-nox-muted">Select sources in the Sources tab to configure tier routing.</p>
      </Card>
    );
  }

  const share = (t: Tier) => (totals.all ? Math.round((totals[t] / totals.all) * 100) : 0);

  return (
    <Card className="overflow-hidden">
      {/* Header + summary */}
      <div className="border-b border-white/[0.08] px-5 pb-4 pt-5 lg:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-[15px] font-semibold tracking-[-0.01em]">Configure data tiers</h3>
            <p className="mt-1 font-mono text-[11px] text-nox-faint">
              {rows.length} sources · {totals.all.toFixed(2)} GB/day ·{' '}
              <span className="text-nox-warn">{share('analytics')}% A</span> /{' '}
              <span className="text-nox-blue">{share('basic')}% B</span> /{' '}
              <span className="text-nox-lilac">{share('datalake')}% L</span>
            </p>
          </div>
          <div className="w-full max-w-[280px] sm:w-[280px]">
            <SplitBar split={totals.all ? { analytics: totals.analytics / totals.all, basic: totals.basic / totals.all, datalake: totals.datalake / totals.all } : { analytics: 0, basic: 0, datalake: 0 }} />
          </div>
        </div>

        {/* Toolbar */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-nox-faint" />
            <Input className="h-9 pl-9" placeholder="Search sources…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-1">
            {(['all', 'analytics', 'basic', 'datalake', 'custom'] as Filter[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={cn(
                  'h-9 rounded-lg border px-3 text-xs font-medium transition',
                  filter === f ? 'border-white/[0.14] bg-nox-surface-2 text-nox-text' : 'border-transparent text-nox-muted hover:text-nox-text',
                )}
              >
                {f === 'all' ? 'All' : f === 'custom' ? 'Custom' : tierMeta[f].label}
                <span className="ml-1.5 font-mono text-[10px] text-nox-faint">{filterCounts[f]}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setSort((s) => (s === 'volume' ? 'name' : 'volume'))}
            className="flex h-9 items-center gap-1.5 rounded-lg border border-white/[0.1] px-3 text-xs text-nox-muted transition hover:border-white/20 hover:text-nox-text"
          >
            <ArrowDownWideNarrow className="h-3.5 w-3.5" />
            {sort === 'volume' ? 'GB/day' : 'Name'}
          </button>
        </div>
      </div>

      {/* Bulk bar */}
      {checkedIds.length > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-nox-accent/25 bg-nox-accent/[0.06] px-5 py-2.5 lg:px-6">
          <span className="text-sm">
            <span className="font-mono text-nox-accent">{checkedIds.length}</span> selected
            <span className="text-nox-muted"> · route all to</span>
          </span>
          <div className="flex items-center gap-2">
            <TierChips active={null} onPick={bulkRoute} size="md" />
            <button type="button" onClick={() => setChecked(new Set())} className="grid h-8 w-8 place-items-center rounded-md text-nox-muted hover:bg-white/[0.06] hover:text-nox-text" title="Clear selection">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}

      {/* Table */}
      <div className="max-h-[60vh] overflow-auto">
        <table className="w-full text-left text-[13px]">
          <thead className="sticky top-0 z-10 bg-nox-surface font-mono text-[11px] text-nox-faint">
            <tr className="border-b border-white/[0.08]">
              <th className="w-10 py-2.5 pl-5 lg:pl-6">
                <input type="checkbox" aria-label="Select all visible" checked={allVisibleChecked} onChange={toggleAllVisible} className="h-3.5 w-3.5 accent-[#3dffa2]" />
              </th>
              <th className="py-2.5 pr-3 font-medium">Source</th>
              <th className="hidden w-[90px] py-2.5 pr-3 text-right font-medium sm:table-cell">GB/day</th>
              <th className="hidden w-[34%] py-2.5 pr-3 font-medium md:table-cell">Split A / B / L</th>
              <th className="w-[140px] py-2.5 pr-5 text-right font-medium lg:pr-6">Route</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-nox-muted">No sources match.</td>
              </tr>
            ) : null}
            {visible.map((r) => {
              const id = r.source.id;
              const single = singleTier(r.split);
              const isOpen = expanded === id;
              return (
                <Fragment key={id}>
                  <tr className={cn('border-b border-white/[0.05] transition hover:bg-white/[0.02]', checked.has(id) && 'bg-nox-accent/[0.04]', isOpen && 'bg-white/[0.02]')}>
                    <td className="py-2 pl-5 lg:pl-6">
                      <input type="checkbox" aria-label={`Select ${r.source.product}`} checked={checked.has(id)} onChange={() => toggleOne(id)} className="h-3.5 w-3.5 accent-[#3dffa2]" />
                    </td>
                    <td className="max-w-0 py-2 pr-3">
                      <p className="truncate font-medium text-nox-text">{r.source.product}</p>
                      <p className="truncate font-mono text-[10.5px] text-nox-faint">
                        <span className="text-nox-muted sm:hidden">{r.dailyGb.toFixed(2)} GB/day · </span>
                        {r.source.vendor} · {r.source.category}
                      </p>
                      <div className="mt-1.5 md:hidden"><SplitBar split={r.split} /></div>
                    </td>
                    <td className="hidden py-2 pr-3 text-right font-mono tabular-nums text-nox-muted sm:table-cell">{r.dailyGb.toFixed(2)}</td>
                    <td className="hidden py-2 pr-3 md:table-cell">
                      <div className="flex items-center gap-3">
                        <SplitBar split={r.split} />
                        <span className="w-[86px] shrink-0 text-right font-mono text-[11px] tabular-nums text-nox-faint">
                          <span className={r.split.analytics ? 'text-nox-warn' : ''}>{pct(r.split.analytics)}</span>/
                          <span className={r.split.basic ? 'text-nox-blue' : ''}>{pct(r.split.basic)}</span>/
                          <span className={r.split.datalake ? 'text-nox-lilac' : ''}>{pct(r.split.datalake)}</span>
                        </span>
                      </div>
                    </td>
                    <td className="py-2 pr-5 lg:pr-6">
                      <div className="flex items-center justify-end gap-1">
                        <TierChips active={single} onPick={(t) => onSplit(id, presetSplit(t))} />
                        <button
                          type="button"
                          title="Custom split"
                          aria-expanded={isOpen}
                          onClick={() => setExpanded(isOpen ? null : id)}
                          className={cn(
                            'grid h-7 w-7 place-items-center rounded-md border transition',
                            isOpen || single === null ? 'border-nox-accent/40 text-nox-accent' : 'border-transparent text-nox-faint hover:text-nox-text',
                          )}
                        >
                          <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {isOpen ? (
                    <tr className="border-b border-white/[0.05] bg-white/[0.02]">
                      <td />
                      <td colSpan={4} className="pb-4 pr-5 pt-1 lg:pr-6">
                        <div className="grid gap-4 sm:grid-cols-3">
                          {TIERS.map((t) => (
                            <label key={t} className="block">
                              <div className="mb-1.5 flex items-center justify-between text-xs">
                                <span className={tierMeta[t].text}>{tierMeta[t].label}</span>
                                <span className="font-mono tabular-nums text-nox-text">{pct(r.split[t])}%</span>
                              </div>
                              <input
                                type="range"
                                min={0}
                                max={100}
                                step={1}
                                value={pct(r.split[t])}
                                onChange={(e) => onSplit(id, rebalance(r.split, t, Number(e.target.value) / 100))}
                                className="w-full"
                                style={{ accentColor: tierMeta[t].hex }}
                              />
                            </label>
                          ))}
                        </div>
                        <p className="mt-2 font-mono text-[10.5px] text-nox-faint">Other tiers rebalance automatically so the split always totals 100%.</p>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

