import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Period & Cycle Tracker（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #BE185D / accent #7C3AED / surface #FDF2F8。
 * 備註：Blush rose + fertility lavender
 */
export const periodAndCycleTracker: DesignTokens = createPreset({
  meta: {
    name: 'period-and-cycle-tracker',
    displayName: 'Period & Cycle Tracker',
    description: 'Period & Cycle Tracker — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["consulting"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#BE185D',
  accentHex: '#7C3AED',
  surfaceLight: { hue: 327, sat: 40 },
  surfaceDark: { hue: 327, sat: 30 },
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
