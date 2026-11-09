import { useMemo } from 'react';
import { ArchitectureDiagram } from '../components/ArchitectureDiagram';
import { RoutingTable } from '../components/RoutingTable';
import { allSources, useCostSummary, useEstimatorStore } from '../store/useEstimatorStore';

export function ArchitecturePage() {
  const selections = useEstimatorStore((s) => s.selections);
  const setSourceSplit = useEstimatorStore((s) => s.setSourceSplit);
  const summary = useCostSummary();

  const selected = useMemo(
    () =>
      allSources
        .filter((source) => selections[source.id]?.selected)
        .map((source) => ({ source, split: selections[source.id].tierSplit })),
    [selections],
  );

  const routed = useMemo(
    () =>
      selected.map(({ source, split }) => ({
        source,
        split,
        // Same volume formula as the cost engine: base ingestion × quantity
        dailyGb: source.base_ingestion * Math.max(1, selections[source.id].quantity || 1),
      })),
    [selected, selections],
  );

  return (
    <div className="space-y-4">
      <ArchitectureDiagram selected={selected} summary={summary} />
      <RoutingTable rows={routed} onSplit={setSourceSplit} />
    </div>
  );
}
