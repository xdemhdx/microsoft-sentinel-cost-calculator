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
                'rounded-xl border px-3 py-2 text-left text-sm transition',
                selected.includes(item)
                  ? 'border-red-400/70 bg-red-500/10 text-red-200'
                  : 'border-slate-700 bg-slate-950/40 text-slate-300 hover:border-slate-500',
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

