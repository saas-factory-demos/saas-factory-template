import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Card & Board Game（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #15803D / accent #D97706 / surface #0F172A。
 * 備註：Felt green + gold on dark
 */
export const cardAndBoardGame: DesignTokens = createPreset({
  meta: {
    name: 'card-and-board-game',
    displayName: 'Card & Board Game',
    description: 'Card & Board Game — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["logistics-trade"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#15803D',
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
