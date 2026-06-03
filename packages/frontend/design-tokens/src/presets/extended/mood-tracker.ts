import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Mood Tracker（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #7C3AED / accent #D97706 / surface #FAF5FF。
 * 備註：Mood purple + insight amber
 */
export const moodTracker: DesignTokens = createPreset({
  meta: {
    name: 'mood-tracker',
    displayName: 'Mood Tracker',
    description: 'Mood Tracker — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["consulting"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#7C3AED',
  accentHex: '#D97706',
  surfaceLight: { hue: 270, sat: 40 },
  surfaceDark: { hue: 270, sat: 30 },
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
