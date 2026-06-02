import * as SelectPrimitive from '@radix-ui/react-select';
import * as React from 'react';

import { cn } from './lib/cn.js';

export const Select = SelectPrimitive.Root;
export const SelectGroup = SelectPrimitive.Group;
export const SelectValue = SelectPrimitive.Value;

/**
 * Select 觸發按鈕（呈現目前選取值）。
 */
export const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      'flex h-10 w-full items-center justify-between',
      'px-3 py-2 text-sm',
      'rounded-[var(--radius-input)]',
      'border border-[hsl(var(--color-border))]',
      'bg-[hsl(var(--surface-base))] text-[hsl(var(--color-foreground))]',
      'transition-all duration-200 ease-out',
      'placeholder:text-[hsl(var(--color-muted-foreground))]',
      'focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary-500))]',
      'disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 opacity-60"
        aria-hidden="true"
      >
        <polyline points="4 6 8 10 12 6" />
      </svg>
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = 'SelectTrigger';

/**
 * Select 下拉內容容器。
 */
export const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      position={position}
      className={cn(
        'relative z-50 min-w-[8rem] overflow-hidden',
        'rounded-[var(--radius-md)]',
        'border border-[hsl(var(--color-border))]',
        'bg-[hsl(var(--surface-raised))] text-[hsl(var(--color-foreground))]',
        'shadow-[var(--shadow-md)]',
        className,
      )}
      {...props}
    >
      <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = 'SelectContent';

/**
 * Select 單一選項。
 */
export const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex w-full cursor-default select-none items-center',
      'rounded-[var(--radius-sm)] py-1.5 pl-8 pr-2 text-sm outline-none',
      'focus:bg-[hsl(var(--color-muted))] focus:text-[hsl(var(--color-foreground))]',
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className,
    )}
    {...props}
  >
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = 'SelectItem';
