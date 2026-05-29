import type { MotionLevel } from '@saas-factory/factory-types';
import type { Transition, Variant, Variants } from 'framer-motion';


/**
 * 預設 variant 名稱集合：四種基礎動畫類型。
 */
export type MotionVariantName = 'fadeIn' | 'slideUp' | 'slideRight' | 'scale';

/**
 * 每個 Level 對應一個 variant 字典。
 * Level 1 → opacity-only；Level 5 → spring + 大位移 + scale + rotate。
 */
export type MotionVariantsByLevel = Record<MotionVariantName, Variants>;

interface LevelProfile {
  translate: number;
  scaleFrom: number;
  rotate: number;
  duration: number;
  useSpring: boolean;
}

/**
 * 各 level 動畫參數（強度遞增）。
 * Level 1：純 opacity；Level 2：加 8px 位移；Level 3：再加微 scale；
 * Level 4：再加短暫 rotate；Level 5：改 spring 物理動畫 + 最大位移。
 */
const LEVEL_PROFILES: Record<MotionLevel, LevelProfile> = {
  1: { translate: 0, scaleFrom: 1, rotate: 0, duration: 0.2, useSpring: false },
  2: { translate: 8, scaleFrom: 1, rotate: 0, duration: 0.25, useSpring: false },
  3: { translate: 16, scaleFrom: 0.95, rotate: 0, duration: 0.3, useSpring: false },
  4: { translate: 24, scaleFrom: 0.92, rotate: 2, duration: 0.35, useSpring: false },
  5: { translate: 32, scaleFrom: 0.9, rotate: 3, duration: 0.4, useSpring: true },
};

function buildTransition(profile: LevelProfile): Transition {
  if (profile.useSpring) {
    return { type: 'spring', stiffness: 220, damping: 20, mass: 0.8 };
  }
  return { duration: profile.duration, ease: [0.22, 1, 0.36, 1] };
}

function buildFadeIn(level: MotionLevel): Variants {
  const profile = LEVEL_PROFILES[level];
  const hidden: Variant = { opacity: 0 };
  const visible: Variant = { opacity: 1, transition: buildTransition(profile) };
  return { hidden, visible };
}

function buildSlideUp(level: MotionLevel): Variants {
  const profile = LEVEL_PROFILES[level];
  const hidden: Variant = { opacity: 0, y: profile.translate };
  const visible: Variant = { opacity: 1, y: 0, transition: buildTransition(profile) };
  if (profile.scaleFrom !== 1) {
    hidden.scale = profile.scaleFrom;
    visible.scale = 1;
  }
  if (profile.rotate !== 0) {
    hidden.rotate = -profile.rotate;
    visible.rotate = 0;
  }
  return { hidden, visible };
}

function buildSlideRight(level: MotionLevel): Variants {
  const profile = LEVEL_PROFILES[level];
  const hidden: Variant = { opacity: 0, x: -profile.translate };
  const visible: Variant = { opacity: 1, x: 0, transition: buildTransition(profile) };
  if (profile.scaleFrom !== 1) {
    hidden.scale = profile.scaleFrom;
    visible.scale = 1;
  }
  if (profile.rotate !== 0) {
    hidden.rotate = profile.rotate;
    visible.rotate = 0;
  }
  return { hidden, visible };
}

function buildScale(level: MotionLevel): Variants {
  const profile = LEVEL_PROFILES[level];
  const hidden: Variant = {
    opacity: 0,
    scale: profile.scaleFrom === 1 ? 0.98 : profile.scaleFrom,
  };
  const visible: Variant = { opacity: 1, scale: 1, transition: buildTransition(profile) };
  if (profile.rotate !== 0) {
    hidden.rotate = profile.rotate;
    visible.rotate = 0;
  }
  return { hidden, visible };
}

/**
 * 建立指定 level 的四種 variant 字典。
 */
export function buildMotionVariants(level: MotionLevel): MotionVariantsByLevel {
  return {
    fadeIn: buildFadeIn(level),
    slideUp: buildSlideUp(level),
    slideRight: buildSlideRight(level),
    scale: buildScale(level),
  };
}

/**
 * 預先建好 Level 1-5 全部 variant，作為查表用。
 */
export const motionVariants: Record<MotionLevel, MotionVariantsByLevel> = {
  1: buildMotionVariants(1),
  2: buildMotionVariants(2),
  3: buildMotionVariants(3),
  4: buildMotionVariants(4),
  5: buildMotionVariants(5),
};
