import type { InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-10 w-full rounded-lg border border-white/[0.1] bg-nox-panel px-3.5 text-sm text-nox-text outline-none transition placeholder:text-nox-faint hover:border-white/[0.16] focus:border-nox-accent/60 focus:ring-2 focus:ring-nox-accent/15 [&[type=number]]:font-mono',
        className,
      )}
      {...props}
    />
  );
}
