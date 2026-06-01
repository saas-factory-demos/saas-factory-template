'use client';

import { motion } from 'framer-motion';



import { motionVariants, type MotionVariantName } from './motion-variants.js';
import { useMotionLevel } from './use-motion-level.js';

import type { MotionLevel } from '@saas-factory/factory-types';
import type { ReactNode } from 'react';

export interface MotionWrapperProps {
  /** 顯式指定 level；不傳則跟隨 Context / Hook 偵測。 */
  level?: MotionLevel;
  /** 動畫 variant 名稱，預設 fadeIn。 */
  variant?: MotionVariantName;
  /** 進場延遲（秒），預設 0。 */
  delay?: number;
  /** 自訂 className（給 Tailwind 等使用）。 */
  className?: string;
  children: ReactNode;
}

/**
 * 通用動畫容器。
 * 根據當前 motion level 與 variant 自動套用 framer-motion variants，
 * 並透過 useMotionLevel 自動處理 prefers-reduced-motion 降級。
 */
export function MotionWrapper({
  level,
  variant = 'fadeIn',
  delay = 0,
  className,
  children,
}: MotionWrapperProps) {
  const { level: effectiveLevel } = useMotionLevel({ level });
  const variants = motionVariants[effectiveLevel][variant];
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={variants}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}
