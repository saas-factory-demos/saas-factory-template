import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Water & Hydration Reminder（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #0284C7 / accent #0891B2 / surface #F0F9FF。
 * 備註：Refreshing blue + water cyan
 */
export const waterAndHydrationReminder: DesignTokens = createPreset({
  meta: {
    name: 'water-and-hydration-reminder',
    displayName: 'Water & Hydration Reminder',
    description: 'Water & Hydration Reminder — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["consulting"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#0284C7',
  accentHex: '#0891B2',
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
