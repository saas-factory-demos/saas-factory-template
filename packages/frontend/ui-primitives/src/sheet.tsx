import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from './lib/cn.js';

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;
export const SheetPortal = DialogPrimitive.Portal;

/** Sheet 遮罩。 */
export const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn('fixed inset-0 z-50 bg-black/50 backdrop-blur-sm', className)}
    {...props}
  />
));
SheetOverlay.displayName = 'SheetOverlay';

const sheetVariants = cva(
  'fixed z-50 gap-4 bg-[hsl(var(--surface-overlay))] p-6 shadow-[var(--shadow-modal)] transition-transform duration-200',
  {
    variants: {
      side: {
        top: 'inset-x-0 top-0 border-b border-[hsl(var(--color-border-subtle))]',
        bottom: 'inset-x-0 bottom-0 border-t border-[hsl(var(--color-border-subtle))]',
        left: 'inset-y-0 left-0 h-full w-3/4 border-r border-[hsl(var(--color-border-subtle))] sm:max-w-sm',
        right:
          'inset-y-0 right-0 h-full w-3/4 border-l border-[hsl(var(--color-border-subtle))] sm:max-w-sm',
      },
    },
    defaultVariants: { side: 'right' },
  },
);

export interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

/** Sheet 主內容（從指定 side 滑入）。 */
export const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  SheetContentProps
>(({ side = 'right', className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <DialogPrimitive.Content ref={ref} className={cn(sheetVariants({ side }), className)} {...props}>
      {children}
    </DialogPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = 'SheetContent';

/** Sheet 標頭。 */
export function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): React.ReactElement {
  return <div className={cn('flex flex-col space-y-2 text-left', className)} {...props} />;
}

/** Sheet footer。 */
export function SheetFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): React.ReactElement {
  return (
    <div
      className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
      {...props}
    />
  );
}

/** Sheet 標題。 */
export const SheetTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold text-[hsl(var(--color-foreground))]', className)}
    {...props}
  />
));
SheetTitle.displayName = 'SheetTitle';

/** Sheet 描述。 */
export const SheetDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-[hsl(var(--color-muted-foreground))]', className)}
    {...props}
  />
));
SheetDescription.displayName = 'SheetDescription';
