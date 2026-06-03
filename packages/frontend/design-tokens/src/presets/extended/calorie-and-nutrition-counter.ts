import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Calorie & Nutrition Counter（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #059669 / accent #EA580C / surface #ECFDF5。
 * 備註：Healthy green + macro orange
 */
export const calorieAndNutritionCounter: DesignTokens = createPreset({
  meta: {
    name: 'calorie-and-nutrition-counter',
    displayName: 'Calorie & Nutrition Counter',
    description: 'Calorie & Nutrition Counter — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["consulting"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#059669',
  accentHex: '#EA580C',
  surfaceLight: { hue: 152, sat: 40 },
  surfaceDark: { hue: 152, sat: 30 },
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
