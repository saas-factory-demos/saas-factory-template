import { MotionWrapper } from '@saas-factory/frontend-motion';

import type { MotionConfig } from './schema-helpers.js';
import type { MotionLevel } from '@saas-factory/factory-types';
import type { MotionVariantName } from '@saas-factory/frontend-motion';
import type { ReactNode } from 'react';

export interface SectionContainerProps {
  /** 額外 className（給外層 section 用）。 */
  className?: string;
  /** 內層 container className（控制最大寬度 / padding）。 */
  innerClassName?: string;
  /** 是否要 fluid（不要 max-w 限制）。 */
  fluid?: boolean;
  motion?: MotionConfig;
  children: ReactNode;
}

const DEFAULT_MOTION: Required<Pick<MotionConfig, 'variant' | 'delay'>> & {
  level?: MotionLevel;
} = { variant: 'slideUp', delay: 0 };

/**
 * 區塊共用容器：負責統一 max-w / 內距 / 進場動畫。
 * 所有 block 主視圖都應包一層此元件，確保版型一致與 motion 行為統一。
 */
export function SectionContainer({
  className,
  innerClassName,
  fluid = false,
  motion,
  children,
}: SectionContainerProps) {
  const motionResolved = motion ?? DEFAULT_MOTION;
  const baseClass = [
    'relative w-full',
    'bg-[hsl(var(--color-background))] text-[hsl(var(--color-foreground))]',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');
  const inner = [
    fluid ? 'w-full' : 'mx-auto w-full max-w-screen-xl',
    'px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20',
    innerClassName ?? '',
  ]
    .filter(Boolean)
    .join(' ');
  const variantName: MotionVariantName = motionResolved.variant ?? 'slideUp';
  return (
    <section className={baseClass}>
      <MotionWrapper
        variant={variantName}
        delay={motionResolved.delay ?? 0}
        level={motionResolved.level}
        className={inner}
      >
        {children}
      </MotionWrapper>
    </section>
  );
}
