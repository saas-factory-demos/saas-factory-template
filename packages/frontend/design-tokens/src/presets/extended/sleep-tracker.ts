import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Sleep Tracker（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #4338CA / accent #7C3AED / surface #0F172A。
 * 備註：Night indigo + dream violet on dark
 */
export const sleepTracker: DesignTokens = createPreset({
  meta: {
    name: 'sleep-tracker',
    displayName: 'Sleep Tracker',
    description: 'Sleep Tracker — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["consulting"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#4338CA',
  accentHex: '#7C3AED',
  surfaceLight: { hue: 222, sat: 40 },
  surfaceDark: { hue: 222, sat: 30 },
  typography: {
    fontFamily: {
      sans: "'Inter', 'Noto Sans TC', system-ui, sans-serif",
      serif: "'Source Serif Pro', 'Noto Serif TC', serif",
      display: "'Inter', 'Noto Sans TC', system-ui, sans-serif",
      mono: "'JetBrains Mono', 'Fira Code', monospace",
    },
    headingFamily: 'sans',
    bodyFamily: 'sans',
  },
  radius: 'soft',
  motion: { level: 2 },
  density: 'normal',
});
