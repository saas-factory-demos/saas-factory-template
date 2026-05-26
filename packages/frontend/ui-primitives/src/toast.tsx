import * as ToastPrimitive from '@radix-ui/react-toast';
import * as React from 'react';

import { cn } from './lib/cn.js';

export const ToastProvider = ToastPrimitive.Provider;

/** Toast viewport（畫面右下角區域）。 */
export const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cn(
      'fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 gap-2',
      'sm:max-w-[420px]',
      className,
    )}
    {...props}
  />
));
ToastViewport.displayName = 'ToastViewport';

/** Toast 主體（單筆通知）。 */
export const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Root
    ref={ref}
    className={cn(
      'group pointer-events-auto relative flex w-full items-center justify-between gap-2 p-4 pr-6',
      'rounded-[var(--radius-md)]',
      'border border-[hsl(var(--color-border-subtle))]',
      'bg-[hsl(var(--surface-raised))] text-[hsl(var(--color-foreground))]',
      'shadow-[var(--shadow-lg)]',
      'transition-all duration-200',
      className,
    )}
    {...props}
  />
));
Toast.displayName = 'Toast';

/** Toast 標題文字。 */
export const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Title ref={ref} className={cn('text-sm font-semibold', className)} {...props} />
));
ToastTitle.displayName = 'ToastTitle';

/** Toast 描述文字。 */
export const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Description
    ref={ref}
    className={cn('text-sm text-[hsl(var(--color-muted-foreground))]', className)}
    {...props}
  />
));
ToastDescription.displayName = 'ToastDescription';

/** Toast 動作按鈕（在通知內提供操作）。 */
export const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Action
    ref={ref}
    className={cn(
      'inline-flex h-8 shrink-0 items-center justify-center px-3 text-sm font-medium',
      'rounded-[var(--radius-sm)]',
      'border border-[hsl(var(--color-border))]',
      'bg-transparent hover:bg-[hsl(var(--color-muted))]',
      'transition-colors',
      className,
    )}
    {...props}
  />
));
ToastAction.displayName = 'ToastAction';

/** Toast 關閉按鈕。 */
export const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Close
    ref={ref}
    className={cn(
      'absolute right-1 top-1 p-1 text-[hsl(var(--color-muted-foreground))]',
      'opacity-70 transition-opacity hover:opacity-100 focus:outline-none',
      className,
    )}
    toast-close=""
    {...props}
  >
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3 w-3"
      aria-hidden="true"
    >
      <line x1="4" y1="4" x2="12" y2="12" />
      <line x1="12" y1="4" x2="4" y2="12" />
    </svg>
  </ToastPrimitive.Close>
));
ToastClose.displayName = 'ToastClose';
