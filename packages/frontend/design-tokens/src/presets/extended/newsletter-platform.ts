import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Newsletter Platform（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #0369A1 / accent #EA580C / surface #F0F9FF。
 * 備註：Trust blue + subscribe orange [Accent adjusted from #F97316 for WCAG 3:1]
 */
export const newsletterPlatform: DesignTokens = createPreset({
  meta: {
    name: 'newsletter-platform',
    displayName: 'Newsletter Platform',
    description: 'Newsletter Platform — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["consulting"],
    motionLevelRecommended: 1,
    darkModePrimary: 'both',
  },
  primaryHex: '#0369A1',
  accentHex: '#EA580C',
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
  radius: 'sharp',
  motion: { level: 1 },
  density: 'normal',
});
