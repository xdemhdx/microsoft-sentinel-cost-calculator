import type { Source, SourceSelection } from '../types';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface SourceCardProps {
  source: Source;
  selection: SourceSelection;
  scaledDailyGb: number;
  onSelect: (checked: boolean) => void;
  onQuantity: (quantity: number) => void;
}

const tierLabel: Record<string, string> = {
  analytics: 'Analytics',
  basic: 'Basic',
  datalake: 'Data Lake',
  smart_split: 'Smart Split',
  free: 'Free',
};

export function SourceCard({ source, selection, scaledDailyGb, onSelect, onQuantity }: SourceCardProps) {
  return (
    <Card className={`group h-[228px] overflow-hidden rounded-xl border transition ${selection.selected ? 'border-nox-accent/45 bg-[linear-gradient(180deg,rgba(61,255,162,0.06),#0e1011_55%)]' : 'border-white/[0.08] hover:border-white/[0.16]'}`}>
      <CardContent className="flex h-full flex-col justify-between p-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge className="text-[10px]">{tierLabel[source.tier_type]}</Badge>
              <Badge className="max-w-[140px] truncate border-nox-accent/20 bg-nox-accent/10 text-[10px] text-nox-accent">{source.category}</Badge>
            </div>
            <Button
              type="button"
              size="sm"
              variant={selection.selected ? 'default' : 'outline'}
              className="min-w-[84px]"
              onClick={() => onSelect(!selection.selected)}
            >
              {selection.selected ? 'Selected' : 'Select'}
            </Button>
          </div>

          <div>
            <p className="truncate text-[11px] text-slate-400">{source.vendor}</p>
            <p className="line-clamp-2 text-sm font-semibold text-white">{source.product}</p>
          </div>

          <p className="line-clamp-2 text-[11px] text-slate-500">{source.description}</p>
          <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
            <div className="h-1 rounded-full bg-nox-accent" style={{ width: `${Math.min(100, (scaledDailyGb / 4) * 100)}%` }} />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Estimated ingestion</span>
            <span className="font-mono font-medium text-nox-text">~{scaledDailyGb.toFixed(2)} GB/day</span>
          </div>
          {source.supports_scaling ? (
            <div className="rounded-lg border border-white/[0.08] bg-nox-panel p-1.5">
              <div className="mb-1 flex items-center justify-between text-[10px] text-slate-500">
                <span>Quantity</span>
                <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-1.5 py-0.5 text-[9px] font-medium text-cyan-100">
                  {selection.quantity}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 min-w-7 rounded-lg px-0 text-[11px]"
                  onClick={() => onQuantity(Math.max(1, selection.quantity - 1))}
                >
                  -
                </Button>
                <Input
                  className="h-7 rounded-lg px-2 text-center text-[11px]"
                  type="number"
                  min={1}
                  value={selection.quantity}
                  onChange={(e) => onQuantity(Math.max(1, Number(e.target.value) || 1))}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 min-w-7 rounded-lg px-0 text-[11px]"
                  onClick={() => onQuantity(selection.quantity + 1)}
                >
                  +
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
