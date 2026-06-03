import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Food Delivery / On-Demand（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #EA580C / accent #2563EB / surface #FFF7ED。
 * 備註：Appetizing orange + trust blue
 */
export const foodDeliveryOnDemand: DesignTokens = createPreset({
  meta: {
    name: 'food-delivery-on-demand',
    displayName: 'Food Delivery / On-Demand',
    description: 'Food Delivery / On-Demand — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["restaurant","food-snacks"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#EA580C',
  accentHex: '#2563EB',
  surfaceLight: { hue: 33, sat: 40 },
  surfaceDark: { hue: 33, sat: 30 },
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
