import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Hotel/Hospitality（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #1E3A8A / accent #A16207 / surface #F8FAFC。
 * 備註：Luxury navy + gold service [Accent adjusted from #CA8A04 for WCAG 3:1]
 */
export const hotelHospitality: DesignTokens = createPreset({
  meta: {
    name: 'hotel-hospitality',
    displayName: 'Hotel/Hospitality',
    description: 'Hotel/Hospitality — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["travel-tour"],
    motionLevelRecommended: 3,
    darkModePrimary: 'both',
  },
  primaryHex: '#1E3A8A',
  accentHex: '#A16207',
  surfaceLight: { hue: 210, sat: 40 },
  surfaceDark: { hue: 210, sat: 30 },
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
