import type { SelectHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn('h-11 w-full rounded-2xl border border-white/10 bg-white/6 px-4 text-sm text-slate-100 outline-none transition focus:border-cyan-300/55 focus:bg-white/8', className)}
      {...props}
    >
      {children}
    </select>
  );
}
