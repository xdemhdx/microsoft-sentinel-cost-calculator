import { useMemo } from 'react';
import { ArchitectureDiagram } from '../components/ArchitectureDiagram';
import { TierSelector } from '../components/TierSelector';
import { allSources, useCostSummary, useEstimatorStore } from '../store/useEstimatorStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import type { Tier } from '../types';

export function ArchitecturePage() {
  const selections = useEstimatorStore((s) => s.selections);
  const setSourceTier = useEstimatorStore((s) => s.setSourceTier);
  const setSourceSplit = useEstimatorStore((s) => s.setSourceSplit);
  const summary = useCostSummary();

  const selected = useMemo(
    () =>
      allSources
        .filter((source) => selections[source.id]?.selected)
        .map((source) => ({ source, split: selections[source.id].tierSplit })),
    [selections],
  );

  const applyPreset = (sourceId: string, preset: Tier) => {
    setSourceSplit(sourceId, {
      analytics: preset === 'analytics' ? 1 : 0,
      basic: preset === 'basic' ? 1 : 0,
      datalake: preset === 'datalake' ? 1 : 0,
    });
  };

  return (
    <div className="space-y-4">
      <ArchitectureDiagram selected={selected} summary={summary} />

      <Card>
        <CardHeader>
          <CardTitle>Configure Data Tiers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {selected.length === 0 ? <p className="text-sm text-slate-400">Select sources in the Sources tab to configure routing.</p> : null}
          {selected.map(({ source, split }) => (
            <div key={source.id} className="space-y-2 rounded-lg border border-white/[0.08] bg-nox-panel p-3.5">
              <p className="text-sm font-medium text-nox-text">{source.vendor} {source.product}</p>
              <TierSelector
                split={split}
                onChange={(tier, value) => setSourceTier(source.id, tier, value)}
                onPreset={(preset) => applyPreset(source.id, preset)}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
