import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Idle & Clicker Game（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #D97706 / accent #7C3AED / surface #FFFBEB。
 * 備註：Coin gold + prestige purple
 */
export const idleAndClickerGame: DesignTokens = createPreset({
  meta: {
    name: 'idle-and-clicker-game',
    displayName: 'Idle & Clicker Game',
    description: 'Idle & Clicker Game — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["consulting"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#D97706',
  accentHex: '#7C3AED',
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
