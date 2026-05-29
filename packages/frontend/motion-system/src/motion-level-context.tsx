'use client';

import { createContext, useMemo, type ReactNode } from 'react';

import type { MotionLevel } from '@saas-factory/factory-types';

/**
 * Motion Level Context 值。
 * level：使用者選擇的動畫強度。
 * respectReducedMotion：是否尊重 prefers-reduced-motion（預設 true）。
 */
export interface MotionLevelContextValue {
  level: MotionLevel;
  respectReducedMotion: boolean;
}

export const MotionLevelContext = createContext<MotionLevelContextValue | null>(null);

export interface MotionLevelProviderProps {
  level: MotionLevel;
  respectReducedMotion?: boolean;
  children: ReactNode;
}

/**
 * App 根注入 Provider。
 * 子元件透過 useMotionLevel() 取得當下 level 與 reducedMotion 狀態。
 */
export function MotionLevelProvider({
  level,
  respectReducedMotion = true,
  children,
}: MotionLevelProviderProps) {
  const value = useMemo<MotionLevelContextValue>(
    () => ({ level, respectReducedMotion }),
    [level, respectReducedMotion],
  );
  return <MotionLevelContext.Provider value={value}>{children}</MotionLevelContext.Provider>;
}
