'use client';

import { useContext, useEffect, useState } from 'react';

import { MotionLevelContext } from './motion-level-context.js';

import type { MotionLevel } from '@saas-factory/factory-types';


export interface UseMotionLevelOptions {
  /** 直接以 prop 注入 level，覆寫 Context 值（測試或一次性場景）。 */
  level?: MotionLevel;
  /** 是否尊重 prefers-reduced-motion；預設跟隨 Context，否則 true。 */
  respectReducedMotion?: boolean;
}

export interface UseMotionLevelResult {
  /** 實際生效 level，若 reducedMotion 啟用會被降到 1。 */
  level: MotionLevel;
  /** 是否偵測到 prefers-reduced-motion 為 reduce。 */
  reducedMotion: boolean;
}

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function detectReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

/**
 * 取得當前生效的 motion level。
 * 優先序：options.level → Context.level → 預設 3。
 * 若 reducedMotion 啟用且 respectReducedMotion=true，回傳 level 強制降為 1。
 */
export function useMotionLevel(options: UseMotionLevelOptions = {}): UseMotionLevelResult {
  const context = useContext(MotionLevelContext);
  const baseLevel: MotionLevel = options.level ?? context?.level ?? 3;
  const respect = options.respectReducedMotion ?? context?.respectReducedMotion ?? true;

  const [reducedMotion, setReducedMotion] = useState<boolean>(() => detectReducedMotion());

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }
    const mql = window.matchMedia(REDUCED_MOTION_QUERY);
    const handler = (event: MediaQueryListEvent): void => {
      setReducedMotion(event.matches);
    };
    setReducedMotion(mql.matches);
    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', handler);
      return () => mql.removeEventListener('change', handler);
    }
    // 舊瀏覽器 fallback
    mql.addListener(handler);
    return () => mql.removeListener(handler);
  }, []);

  const effectiveLevel: MotionLevel = respect && reducedMotion ? 1 : baseLevel;
  return { level: effectiveLevel, reducedMotion };
}
