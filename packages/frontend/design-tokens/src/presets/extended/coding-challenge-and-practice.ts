import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Coding Challenge & Practice（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #22C55E / accent #D97706 / surface #0F172A。
 * 備註：Code green + difficulty amber on dark
 */
export const codingChallengeAndPractice: DesignTokens = createPreset({
  meta: {
    name: 'coding-challenge-and-practice',
    displayName: 'Coding Challenge & Practice',
    description: 'Coding Challenge & Practice — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["saas-software"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#22C55E',
  accentHex: '#D97706',
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
