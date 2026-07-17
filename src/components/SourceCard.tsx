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
    <Card className={`group h-[228px] overflow-hidden rounded-xl border transition ${selection.selected ? 'border-cyan-300/55 shadow-[0_0_0_1px_rgba(34,211,238,0.22)]' : 'border-slate-700 hover:border-slate-500'}`}>
      <CardContent className="flex h-full flex-col justify-between p-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-slate-900/70 text-[10px] text-slate-300">{tierLabel[source.tier_type]}</Badge>
              <Badge className="border-cyan-400/25 bg-cyan-400/10 text-[10px] text-cyan-100">{source.category}</Badge>
            </div>
            <Button
              type="button"
              size="sm"
              variant={selection.selected ? 'secondary' : 'outline'}
              className="min-w-[84px]"
              onClick={() => onSelect(!selection.selected)}
            >
              {selection.selected ? 'Unselect' : 'Select'}
            </Button>
          </div>

          <div>
            <p className="truncate text-[11px] text-slate-400">{source.vendor}</p>
            <p className="line-clamp-2 text-sm font-semibold text-white">{source.product}</p>
          </div>

          <p className="line-clamp-2 text-[11px] text-slate-500">{source.description}</p>
          <div className="h-1.5 rounded-full bg-slate-800">
            <div className="h-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-sky-500" style={{ width: `${Math.min(100, (scaledDailyGb / 4) * 100)}%` }} />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Estimated ingestion</span>
            <span className="font-medium text-slate-200">~{scaledDailyGb.toFixed(2)} GB/day</span>
          </div>
          {source.supports_scaling ? (
            <div className="rounded-xl border border-white/8 bg-white/[0.04] p-1">
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
