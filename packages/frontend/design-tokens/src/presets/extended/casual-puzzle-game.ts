import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Casual Puzzle Game（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #EC4899 / accent #F59E0B / surface #FDF2F8。
 * 備註：Cheerful pink + reward gold
 */
export const casualPuzzleGame: DesignTokens = createPreset({
  meta: {
    name: 'casual-puzzle-game',
    displayName: 'Casual Puzzle Game',
    description: 'Casual Puzzle Game — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["consulting"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#EC4899',
  accentHex: '#F59E0B',
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
