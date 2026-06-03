import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Podcast Platform（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #1E1B4B / accent #F97316 / surface #0F0F23。
 * 備註：Dark audio + warm accent
 */
export const podcastPlatform: DesignTokens = createPreset({
  meta: {
    name: 'podcast-platform',
    displayName: 'Podcast Platform',
    description: 'Podcast Platform — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["consulting"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#1E1B4B',
  accentHex: '#F97316',
  surfaceLight: { hue: 240, sat: 40 },
  surfaceDark: { hue: 240, sat: 30 },
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
