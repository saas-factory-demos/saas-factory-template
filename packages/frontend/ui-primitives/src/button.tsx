import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from './lib/cn.js';

/**
 * Button variant 樣式定義，全部 className 都接 CSS Variables（不寫死顏色 / radius）。
 * 樣式假設客戶站使用 Tailwind 4 並把 token 變數注入 :root（透過 generateCSSVariables）。
 */
export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 ease-out disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'bg-[hsl(var(--color-primary-500))] text-[hsl(var(--color-primary-50))] hover:bg-[hsl(var(--color-primary-600))]',
        destructive:
          'bg-[hsl(var(--color-danger-500))] text-[hsl(var(--color-danger-50))] hover:bg-[hsl(var(--color-danger-600))]',
        outline:
          'border border-[hsl(var(--color-border))] bg-transparent hover:bg-[hsl(var(--color-muted))] text-[hsl(var(--color-foreground))]',
        secondary:
          'bg-[hsl(var(--color-secondary-500))] text-[hsl(var(--color-secondary-50))] hover:bg-[hsl(var(--color-secondary-600))]',
        ghost:
          'bg-transparent hover:bg-[hsl(var(--color-muted))] text-[hsl(var(--color-foreground))]',
        link: 'text-[hsl(var(--color-primary-500))] underline-offset-4 hover:underline bg-transparent',
      },
      size: {
        default: 'h-10 px-4 py-2 rounded-[var(--radius-button)]',
        sm: 'h-9 px-3 rounded-[var(--radius-button)] text-xs',
        lg: 'h-11 px-6 rounded-[var(--radius-button)] text-base',
        icon: 'h-10 w-10 rounded-[var(--radius-button)]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** 是否把樣式套到子元素（用 Radix Slot，例如包 `<a>`） */
  asChild?: boolean;
}

/**
 * 通用按鈕。支援 6 種 variant + 4 種 size，asChild 可讓樣式套到任意 child。
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />
    );
  },
);
Button.displayName = 'Button';
