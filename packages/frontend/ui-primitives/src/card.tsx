import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from './lib/cn.js';

export const cardVariants = cva(
  'rounded-[var(--radius-card)] text-[hsl(var(--color-foreground))] transition-all duration-200 ease-out',
  {
    variants: {
      variant: {
        default:
          'bg-[hsl(var(--surface-raised))] border border-[hsl(var(--color-border-subtle))] shadow-[var(--shadow-card)]',
        outlined: 'bg-transparent border border-[hsl(var(--color-border))]',
        elevated: 'bg-[hsl(var(--surface-raised))] shadow-[var(--shadow-card-hover)]',
        ghost: 'bg-[hsl(var(--surface-base))]',
      },
      padding: {
        none: 'p-0',
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
    },
  },
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

/**
 * 卡片容器。4 種 variant、4 種 padding。
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, ...props }, ref) => (
    <div ref={ref} className={cn(cardVariants({ variant, padding, className }))} {...props} />
  ),
);
Card.displayName = 'Card';

/** Card 標頭區塊（標題 + 副標）。 */
export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5', className)} {...props} />
  ),
);
CardHeader.displayName = 'CardHeader';

/** Card 主標題。 */
export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-lg font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  ),
);
CardTitle.displayName = 'CardTitle';

/** Card 描述文字。 */
export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm text-[hsl(var(--color-muted-foreground))]', className)} {...props} />
));
CardDescription.displayName = 'CardDescription';

/** Card 主內容區。 */
export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('pt-4', className)} {...props} />,
);
CardContent.displayName = 'CardContent';

/** Card 底部 footer。 */
export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center pt-4', className)} {...props} />
  ),
);
CardFooter.displayName = 'CardFooter';
