import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from './lib/cn.js';

export const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary-500))]',
  {
    variants: {
      variant: {
        default:
          'bg-[hsl(var(--color-primary-500))] text-[hsl(var(--color-primary-50))]',
        secondary:
          'bg-[hsl(var(--color-secondary-500))] text-[hsl(var(--color-secondary-50))]',
        destructive:
          'bg-[hsl(var(--color-danger-500))] text-[hsl(var(--color-danger-50))]',
        success:
          'bg-[hsl(var(--color-success-500))] text-[hsl(var(--color-success-50))]',
        warning:
          'bg-[hsl(var(--color-warning-500))] text-[hsl(var(--color-warning-50))]',
        outline:
          'border border-[hsl(var(--color-border))] text-[hsl(var(--color-foreground))] bg-transparent',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

/**
 * 標籤 / chip。6 種 variant。
 */
export function Badge({ className, variant, ...props }: BadgeProps): React.ReactElement {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}
