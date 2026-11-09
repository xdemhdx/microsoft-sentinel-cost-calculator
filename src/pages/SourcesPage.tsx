import { useMemo, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Search } from 'lucide-react';
import { Input } from '../components/ui/input';
import { SourceCard } from '../components/SourceCard';
import { allSources, useEstimatorStore } from '../store/useEstimatorStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/button';
import type { Source } from '../types';

const columns = 3;

const getScaled = (_source: Source, _setup: ReturnType<typeof useEstimatorStore.getState>['setup'], quantity: number) => {
  return Math.max(0, quantity || 1) * (_source.base_ingestion || 0);
};

export function SourcesPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All Sources');
  const [selectedOnly, setSelectedOnly] = useState(false);

  const setup = useEstimatorStore((s) => s.setup);
  const selections = useEstimatorStore((s) => s.selections);
  const toggleSource = useEstimatorStore((s) => s.toggleSource);
  const setSourceQuantity = useEstimatorStore((s) => s.setSourceQuantity);

  const selectedCount = useMemo(() => Object.values(selections).filter((s) => s.selected).length, [selections]);

  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    allSources.forEach((s) => map.set(s.category, (map.get(s.category) || 0) + 1));
    return map;
  }, []);

  const categories = useMemo(
    () => ['All Sources', ...Array.from(categoryCounts.keys()).sort()],
    [categoryCounts],
  );

  const filtered = useMemo(
    () =>
      allSources.filter((source) => {
        const byCategory = category === 'All Sources' || source.category === category;
        const bySearch = `${source.vendor} ${source.product} ${source.description}`.toLowerCase().includes(search.toLowerCase());
        const bySelected = !selectedOnly || Boolean(selections[source.id]?.selected);
        return byCategory && bySearch && bySelected;
      }),
    [category, search, selectedOnly, selections],
  );

  const rows = Math.ceil(filtered.length / columns);
  const parentRef = useRef<HTMLDivElement | null>(null);
  const rowVirtualizer = useVirtualizer({
    count: rows,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 248,
    overscan: 6,
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base">Select Log Sources</CardTitle>
              <p className="mt-1 text-xs text-slate-400">{selectedCount} of {allSources.length} sources selected</p>
            </div>
            <div className="flex w-full max-w-2xl gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input className="pl-9" placeholder="Search sources..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Button
                variant={selectedOnly ? 'default' : 'outline'}
                onClick={() => setSelectedOnly((v) => !v)}
              >
                {selectedOnly ? 'Show All Sources' : `Show Selected Sources (${selectedCount})`}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {categories.map((item) => {
              const count = item === 'All Sources' ? allSources.length : categoryCounts.get(item) || 0;
              return (
                <button
                  key={item}
                  onClick={() => setCategory(item)}
                  className={cn(
                    'rounded-md border px-2.5 py-1 font-mono text-[11px] transition',
                    item === category
                      ? 'border-nox-accent/40 bg-nox-accent/10 text-nox-accent'
                      : 'border-white/[0.08] bg-nox-surface-2 text-nox-muted hover:border-white/[0.14] hover:text-nox-text',
                  )}
                >
                  {item} ({count})
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div ref={parentRef} className="h-[72vh] overflow-auto rounded-[14px] border border-white/[0.08] bg-nox-bg/60 p-2">
        <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative' }}>
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const rowItems = filtered.slice(virtualRow.index * columns, virtualRow.index * columns + columns);
            return (
              <div
                key={virtualRow.index}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                className="grid grid-cols-1 gap-3 p-1 xl:grid-cols-3"
              >
                {rowItems.map((source) => {
                  const selection = selections[source.id];
                  const scaled = getScaled(source, setup, selection?.quantity ?? 1);
                  return (
                    <SourceCard
                      key={source.id}
                      source={source}
                      selection={selection}
                      scaledDailyGb={scaled}
                      onSelect={(checked) => toggleSource(source.id, checked)}
                      onQuantity={(quantity) => setSourceQuantity(source.id, quantity)}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
