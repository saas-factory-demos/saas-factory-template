import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Plant Care Tracker（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #15803D / accent #D97706 / surface #F0FDF4。
 * 備註：Nature green + sun yellow
 */
export const plantCareTracker: DesignTokens = createPreset({
  meta: {
    name: 'plant-care-tracker',
    displayName: 'Plant Care Tracker',
    description: 'Plant Care Tracker — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["logistics-trade"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#15803D',
  accentHex: '#D97706',
  surfaceLight: { hue: 138, sat: 40 },
  surfaceDark: { hue: 138, sat: 30 },
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
