import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Event Management（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #7C3AED / accent #EA580C / surface #FAF5FF。
 * 備註：Excitement purple + action orange [Accent adjusted from #F97316 for WCAG 3:1]
 */
export const eventManagement: DesignTokens = createPreset({
  meta: {
    name: 'event-management',
    displayName: 'Event Management',
    description: 'Event Management — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["event-conference"],
    motionLevelRecommended: 3,
    darkModePrimary: 'both',
  },
  primaryHex: '#7C3AED',
  accentHex: '#EA580C',
  surfaceLight: { hue: 270, sat: 40 },
  surfaceDark: { hue: 270, sat: 30 },
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
