import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Restaurant/Food Service（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #DC2626 / accent #A16207 / surface #FEF2F2。
 * 備註：Appetizing red + warm gold [Accent adjusted from #CA8A04 for WCAG 3:1]
 */
export const restaurantFoodService: DesignTokens = createPreset({
  meta: {
    name: 'restaurant-food-service',
    displayName: 'Restaurant/Food Service',
    description: 'Restaurant/Food Service — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["restaurant","food-snacks"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#DC2626',
  accentHex: '#A16207',
  surfaceLight: { hue: 0, sat: 40 },
  surfaceDark: { hue: 0, sat: 30 },
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
  radius: 'plush',
  motion: { level: 2 },
  density: 'normal',
});
