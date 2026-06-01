import * as PopoverPrimitive from '@radix-ui/react-popover';
import * as React from 'react';

import { cn } from './lib/cn.js';

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverAnchor = PopoverPrimitive.Anchor;

/** Popover 內容容器（自動定位）。 */
export const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = 'center', sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        'z-50 w-72 p-4 outline-none',
        'rounded-[var(--radius-md)]',
        'border border-[hsl(var(--color-border))]',
        'bg-[hsl(var(--surface-raised))] text-[hsl(var(--color-foreground))]',
        'shadow-[var(--shadow-md)]',
        className,
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = 'PopoverContent';
