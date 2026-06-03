import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Word & Crossword Game（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #15803D / accent #D97706 / surface #FFFFFF。
 * 備註：Word green + letter amber
 */
export const wordAndCrosswordGame: DesignTokens = createPreset({
  meta: {
    name: 'word-and-crossword-game',
    displayName: 'Word & Crossword Game',
    description: 'Word & Crossword Game — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["consulting"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#15803D',
  accentHex: '#D97706',
  surfaceLight: { hue: 0, sat: 0 },
  surfaceDark: { hue: 0, sat: 0 },
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
