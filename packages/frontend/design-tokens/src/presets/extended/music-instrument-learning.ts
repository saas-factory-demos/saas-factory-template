import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Music Instrument Learning（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #DC2626 / accent #D97706 / surface #FFFBEB。
 * 備註：Musical red + warm amber
 */
export const musicInstrumentLearning: DesignTokens = createPreset({
  meta: {
    name: 'music-instrument-learning',
    displayName: 'Music Instrument Learning',
    description: 'Music Instrument Learning — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["event-conference"],
    motionLevelRecommended: 3,
    darkModePrimary: 'both',
  },
  primaryHex: '#DC2626',
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
  motion: { level: 3 },
  density: 'normal',
});
