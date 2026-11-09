import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cn } from '../../lib/utils';

export function Switch({ className, ...props }: SwitchPrimitive.SwitchProps) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-white/[0.14] bg-nox-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nox-accent/60 data-[state=checked]:border-nox-accent data-[state=checked]:bg-nox-accent',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="pointer-events-none block h-[18px] w-[18px] rounded-full bg-nox-muted shadow transition-transform data-[state=checked]:translate-x-[22px] data-[state=checked]:bg-nox-ink data-[state=unchecked]:translate-x-[2px]" />
    </SwitchPrimitive.Root>
  );
}
