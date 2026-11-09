import type { SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        className={cn(
          'h-10 w-full appearance-none truncate rounded-lg border border-white/[0.1] bg-nox-panel pl-3.5 pr-9 text-sm text-nox-text outline-none transition hover:border-white/[0.16] focus:border-nox-accent/60 focus:ring-2 focus:ring-nox-accent/15',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-nox-faint" />
    </div>
  );
}
