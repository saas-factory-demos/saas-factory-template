import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Road Trip Planner（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #EA580C / accent #D97706 / surface #FFF7ED。
 * 備註：Adventure orange + map teal
 */
export const roadTripPlanner: DesignTokens = createPreset({
  meta: {
    name: 'road-trip-planner',
    displayName: 'Road Trip Planner',
    description: 'Road Trip Planner — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["consulting"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#EA580C',
  accentHex: '#D97706',
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
  radius: 'soft',
  motion: { level: 2 },
  density: 'normal',
});
