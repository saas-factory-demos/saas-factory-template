import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Recipe & Cooking App（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #9A3412 / accent #059669 / surface #FFFBEB。
 * 備註：Warm terracotta + fresh green
 */
export const recipeAndCookingApp: DesignTokens = createPreset({
  meta: {
    name: 'recipe-and-cooking-app',
    displayName: 'Recipe & Cooking App',
    description: 'Recipe & Cooking App — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["restaurant","food-snacks"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#9A3412',
  accentHex: '#059669',
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
  radius: 'plush',
  motion: { level: 2 },
  density: 'normal',
});
