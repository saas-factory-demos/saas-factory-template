import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Subscription Box Service（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #D946EF / accent #EA580C / surface #FDF4FF。
 * 備註：Excitement purple + urgency orange [Accent adjusted from #F97316 for WCAG 3:1]
 */
export const subscriptionBoxService: DesignTokens = createPreset({
  meta: {
    name: 'subscription-box-service',
    displayName: 'Subscription Box Service',
    description: 'Subscription Box Service — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["consulting"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#D946EF',
  accentHex: '#EA580C',
  surfaceLight: { hue: 289, sat: 40 },
  surfaceDark: { hue: 289, sat: 30 },
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
