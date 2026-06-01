import * as SwitchPrimitive from '@radix-ui/react-switch';
import * as React from 'react';

import { cn } from './lib/cn.js';

/**
 * 開關元件（Toggle），基於 Radix Switch primitive。
 */
export const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(
      'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center',
      'rounded-full border-2 border-transparent',
      'transition-all duration-200 ease-out',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-primary-500))]',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'data-[state=checked]:bg-[hsl(var(--color-primary-500))]',
      'data-[state=unchecked]:bg-[hsl(var(--color-muted))]',
      className,
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb
      className={cn(
        'pointer-events-none block h-5 w-5 rounded-full',
        'bg-[hsl(var(--surface-base))] shadow-[var(--shadow-sm)]',
        'transition-transform duration-200 ease-out',
        'data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0',
      )}
    />
  </SwitchPrimitive.Root>
));
Switch.displayName = 'Switch';
