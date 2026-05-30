import * as React from 'react';

import { cn } from './lib/cn.js';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

/**
 * 多行文字輸入。樣式與 Input 對齊，全部走 CSS Variables。
 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'flex min-h-[80px] w-full px-3 py-2 text-sm',
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
Textarea.displayName = 'Textarea';
