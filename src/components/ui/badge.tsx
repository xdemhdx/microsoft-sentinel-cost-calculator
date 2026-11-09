import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border border-white/[0.08] bg-nox-surface-2 px-2 py-0.5 font-mono text-[11px] font-medium text-nox-muted',
        className,
      )}
      {...props}
    />
  );
}
