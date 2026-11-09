import { formatDistanceToNowStrict } from './date';
import { useCostSummary, useEstimatorStore } from '../store/useEstimatorStore';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { formatCurrency } from '../lib/utils';
import { calculateCosts } from '../lib/calc';

export function ScenarioComparison() {
  const summary = useCostSummary();
  const scenarioName = useEstimatorStore((s) => s.scenarioName);
  const setScenarioName = useEstimatorStore((s) => s.setScenarioName);
  const scenarios = useEstimatorStore((s) => s.scenarios);
  const saveScenario = useEstimatorStore((s) => s.saveScenario);
  const loadScenario = useEstimatorStore((s) => s.loadScenario);
  const deleteScenario = useEstimatorStore((s) => s.deleteScenario);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scenario Comparison</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
          <Input value={scenarioName} onChange={(e) => setScenarioName(e.target.value)} placeholder="Scenario name" />
          <Button onClick={saveScenario}>Save Current Scenario</Button>
        </div>
        <p className="text-xs text-slate-400">
          Active scenario monthly estimate: <span className="font-semibold text-slate-100">{formatCurrency(summary.discountedMonthlyCost)}</span>
        </p>

        <div className="space-y-2">
          {scenarios.length === 0 ? <p className="text-sm text-slate-400">No saved scenarios yet.</p> : null}
          {scenarios.map((scenario) => {
            const scenarioSummary = calculateCosts(scenario.setup, scenario.selections);
            const delta = summary.discountedMonthlyCost - scenarioSummary.discountedMonthlyCost;

            return (
              <div key={scenario.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/[0.08] bg-nox-panel px-3.5 py-2.5">
                <div>
                  <p className="text-sm font-medium text-slate-100">{scenario.name}</p>
                  <p className="text-xs text-slate-400">
                    {formatCurrency(scenarioSummary.discountedMonthlyCost)} · saved {formatDistanceToNowStrict(scenario.savedAt)} ago
                  </p>
                  <p className={`text-xs ${delta <= 0 ? 'text-emerald-300' : 'text-amber-300'}`}>
                    vs active: {delta <= 0 ? 'Save' : 'Add'} {formatCurrency(Math.abs(delta))}/month
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => loadScenario(scenario.id)}>
                    Load
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => deleteScenario(scenario.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
