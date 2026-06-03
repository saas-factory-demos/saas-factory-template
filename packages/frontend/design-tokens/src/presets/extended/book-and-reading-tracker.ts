import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Book & Reading Tracker（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #78716C / accent #D97706 / surface #FFFBEB。
 * 備註：Book brown + page amber
 */
export const bookAndReadingTracker: DesignTokens = createPreset({
  meta: {
    name: 'book-and-reading-tracker',
    displayName: 'Book & Reading Tracker',
    description: 'Book & Reading Tracker — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["consulting"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#78716C',
  accentHex: '#D97706',
  surfaceLight: { hue: 48, sat: 40 },
  surfaceDark: { hue: 48, sat: 30 },
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
