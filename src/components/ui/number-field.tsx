import { Minus, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  unit?: string;
  step?: number;
  min?: number;
  className?: string;
}

/** Compact number input with a unit suffix and -/+ steppers. */
export function NumberField({ label, value, onChange, unit, step = 1, min = 0, className }: NumberFieldProps) {
  const set = (v: number) => onChange(Math.max(min, Number.isFinite(v) ? v : min));

  return (
    <label className={cn('flex flex-col gap-1.5 text-xs font-medium text-nox-muted', className)}>
      {label}
      <div className="flex h-10 items-center rounded-lg border border-white/[0.1] bg-nox-panel transition focus-within:border-nox-accent/60 focus-within:ring-2 focus-within:ring-nox-accent/15 hover:border-white/[0.16]">
        <button
          type="button"
          tabIndex={-1}
          aria-label={`Decrease ${label}`}
          onClick={() => set(value - step)}
          className="grid h-full w-8 shrink-0 place-items-center text-nox-faint transition hover:text-nox-text"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <input
          type="number"
          min={min}
          value={value}
          onChange={(e) => set(Number(e.target.value))}
          className="h-full w-full min-w-0 bg-transparent text-center font-mono text-sm text-nox-text outline-none"
        />
        {unit ? <span className="shrink-0 pl-1 font-mono text-[10.5px] text-nox-faint">{unit}</span> : null}
        <button
          type="button"
          tabIndex={-1}
          aria-label={`Increase ${label}`}
          onClick={() => set(value + step)}
          className="grid h-full w-8 shrink-0 place-items-center text-nox-faint transition hover:text-nox-text"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </label>
  );
}
