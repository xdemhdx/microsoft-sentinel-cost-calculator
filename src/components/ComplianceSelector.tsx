import { compliances } from '../data/constants';
import { useEstimatorStore } from '../store/useEstimatorStore';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { cn } from '../lib/utils';

export function ComplianceSelector() {
  const selected = useEstimatorStore((s) => s.compliance);
  const setCompliance = useEstimatorStore((s) => s.setCompliance);

  const toggle = (item: string) => {
    if (selected.includes(item)) {
      setCompliance(selected.filter((x) => x !== item));
      return;
    }
    setCompliance([...selected, item]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compliance Requirements</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {compliances.map((item) => (
            <button
              key={item}
              className={cn(
                'flex items-center justify-between rounded-lg border px-3.5 py-2.5 text-left font-mono text-[13px] transition',
                selected.includes(item)
                  ? 'border-nox-accent/40 bg-nox-accent/[0.08] text-nox-accent'
                  : 'border-white/[0.08] bg-nox-panel text-nox-muted hover:border-white/[0.14] hover:text-nox-text',
              )}
              onClick={() => toggle(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

