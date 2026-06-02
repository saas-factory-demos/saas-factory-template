import * as React from 'react';

import { cn } from './lib/cn.js';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

/**
 * 一般 input 元件。樣式經 CSS Variables 控制 radius / border / background。
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          'flex h-10 w-full px-3 py-2 text-sm',
          'rounded-[var(--radius-input)]',
          'border border-[hsl(var(--color-border))]',
          'bg-[hsl(var(--surface-base))] text-[hsl(var(--color-foreground))]',
          'placeholder:text-[hsl(var(--color-muted-foreground))]',
          'transition-all duration-200 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-primary-500))]',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';
