import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Fitness/Gym App（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #F97316 / accent #22C55E / surface #1F2937。
 * 備註：Energy orange + success green
 */
export const fitnessGymApp: DesignTokens = createPreset({
  meta: {
    name: 'fitness-gym-app',
    displayName: 'Fitness/Gym App',
    description: 'Fitness/Gym App — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["fitness-gym","sports-outdoor"],
    motionLevelRecommended: 3,
    darkModePrimary: 'both',
  },
  primaryHex: '#F97316',
  accentHex: '#22C55E',
  surfaceLight: { hue: 215, sat: 28 },
  surfaceDark: { hue: 215, sat: 28 },
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
