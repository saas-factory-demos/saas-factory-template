import * as TabsPrimitive from '@radix-ui/react-tabs';
import * as React from 'react';

import { cn } from './lib/cn.js';

export const Tabs = TabsPrimitive.Root;

/** Tabs 上方按鈕列。 */
export const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'inline-flex h-10 items-center justify-center p-1',
      'rounded-[var(--radius-md)]',
      'bg-[hsl(var(--color-muted))] text-[hsl(var(--color-muted-foreground))]',
      className,
    )}
    {...props}
  />
));
TabsList.displayName = 'TabsList';

/** Tabs 單一頁籤按鈕。 */
export const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center whitespace-nowrap',
      'rounded-[var(--radius-sm)] px-3 py-1.5 text-sm font-medium',
      'transition-all duration-200 ease-out',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-primary-500))]',
      'disabled:pointer-events-none disabled:opacity-50',
      'data-[state=active]:bg-[hsl(var(--surface-base))] data-[state=active]:text-[hsl(var(--color-foreground))] data-[state=active]:shadow-[var(--shadow-sm)]',
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = 'TabsTrigger';

/** Tabs 對應內容區。 */
export const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-primary-500))]',
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = 'TabsContent';
