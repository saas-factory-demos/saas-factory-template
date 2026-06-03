import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Arcade & Retro Game（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #DC2626 / accent #22C55E / surface #0F172A。
 * 備註：Neon red+blue on dark + score green
 */
export const arcadeAndRetroGame: DesignTokens = createPreset({
  meta: {
    name: 'arcade-and-retro-game',
    displayName: 'Arcade & Retro Game',
    description: 'Arcade & Retro Game — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["nightclub-bar"],
    motionLevelRecommended: 5,
    darkModePrimary: 'both',
  },
  primaryHex: '#DC2626',
  accentHex: '#22C55E',
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
  motion: { level: 5 },
  density: 'normal',
});
