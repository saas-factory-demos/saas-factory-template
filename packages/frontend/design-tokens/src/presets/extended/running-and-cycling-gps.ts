import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Running & Cycling GPS（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #EA580C / accent #059669 / surface #0F172A。
 * 備註：Energetic orange + pace green on dark
 */
export const runningAndCyclingGps: DesignTokens = createPreset({
  meta: {
    name: 'running-and-cycling-gps',
    displayName: 'Running & Cycling GPS',
    description: 'Running & Cycling GPS — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["consulting"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#EA580C',
  accentHex: '#059669',
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
