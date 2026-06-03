import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Weather App（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #0284C7 / accent #F59E0B / surface #F0F9FF。
 * 備註：Sky blue + sun amber
 */
export const weatherApp: DesignTokens = createPreset({
  meta: {
    name: 'weather-app',
    displayName: 'Weather App',
    description: 'Weather App — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["consulting"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#0284C7',
  accentHex: '#F59E0B',
  surfaceLight: { hue: 204, sat: 40 },
  surfaceDark: { hue: 204, sat: 30 },
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
