import type { Tier } from '../types';
import { Input } from './ui/input';
import { Button } from './ui/button';

interface TierSelectorProps {
  split: Record<Tier, number>;
  onChange: (tier: Tier, value: number) => void;
  onPreset?: (preset: Tier) => void;
}

const tiers: Tier[] = ['analytics', 'basic', 'datalake'];
const tierMeta = {
  analytics: { label: 'Analytics', accent: 'text-amber-200', chip: 'bg-amber-500/10 text-amber-200' },
  basic: { label: 'Basic', accent: 'text-indigo-200', chip: 'bg-indigo-500/10 text-indigo-200' },
  datalake: { label: 'Data Lake', accent: 'text-emerald-200', chip: 'bg-emerald-500/10 text-emerald-200' },
} as const;

export function TierSelector({ split, onChange, onPreset }: TierSelectorProps) {
  const applyPreset = (preset: Tier) => {
    if (onPreset) {
      onPreset(preset);
      return;
    }

    tiers.forEach((tier) => onChange(tier, tier === preset ? 1 : 0));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {tiers.map((tier) => (
          <Button key={tier} type="button" size="sm" variant="outline" className="h-8 text-[11px]" onClick={() => applyPreset(tier)}>
            Route all to {tierMeta[tier].label}
          </Button>
        ))}
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        {tiers.map((tier) => (
          <label key={tier} className="rounded-xl border border-white/8 bg-white/[0.03] p-2">
            <div className="mb-1.5 flex items-center justify-between text-xs text-slate-400">
              <span className={tierMeta[tier].accent}>{tierMeta[tier].label}</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] ${tierMeta[tier].chip}`}>{Math.round(split[tier] * 100)}%</span>
            </div>
            <Input
              type="number"
              min={0}
              max={100}
              className="h-9 text-center text-xs"
              value={Math.round(split[tier] * 100)}
              onChange={(e) => onChange(tier, Number(e.target.value) / 100)}
            />
          </label>
        ))}
      </div>
    </div>
  );
}
