import * as React from 'react';

import { cn } from './lib/cn.js';

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * Loading skeleton 元件。簡單脈動動畫 + muted 背景色。
 */
export function Skeleton({ className, ...props }: SkeletonProps): React.ReactElement {
  return (
    <div
      className={cn(
        'animate-pulse rounded-[var(--radius-md)] bg-[hsl(var(--color-muted))]',
        className,
      )}
      {...props}
    />
  );
}
