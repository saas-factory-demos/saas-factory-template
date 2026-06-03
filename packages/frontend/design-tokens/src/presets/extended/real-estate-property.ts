import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Real Estate/Property（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #0F766E / accent #0369A1 / surface #F0FDFA。
 * 備註：Trust teal + professional blue
 */
export const realEstateProperty: DesignTokens = createPreset({
  meta: {
    name: 'real-estate-property',
    displayName: 'Real Estate/Property',
    description: 'Real Estate/Property — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["realestate"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#0F766E',
  accentHex: '#0369A1',
  surfaceLight: { hue: 166, sat: 40 },
  surfaceDark: { hue: 166, sat: 30 },
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
  radius: 'subtle',
  motion: { level: 2 },
  density: 'normal',
});
