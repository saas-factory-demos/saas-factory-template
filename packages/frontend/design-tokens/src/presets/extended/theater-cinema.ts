import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Theater/Cinema（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #1E1B4B / accent #CA8A04 / surface #0F0F23。
 * 備註：Dramatic dark + spotlight gold
 */
export const theaterCinema: DesignTokens = createPreset({
  meta: {
    name: 'theater-cinema',
    displayName: 'Theater/Cinema',
    description: 'Theater/Cinema — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["consulting"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#1E1B4B',
  accentHex: '#CA8A04',
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
