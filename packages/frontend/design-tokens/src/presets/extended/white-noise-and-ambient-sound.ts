import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * White Noise & Ambient Sound（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #475569 / accent #4338CA / surface #0F172A。
 * 備註：Ambient grey + deep indigo on dark
 */
export const whiteNoiseAndAmbientSound: DesignTokens = createPreset({
  meta: {
    name: 'white-noise-and-ambient-sound',
    displayName: 'White Noise & Ambient Sound',
    description: 'White Noise & Ambient Sound — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["consulting"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#475569',
  accentHex: '#4338CA',
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
