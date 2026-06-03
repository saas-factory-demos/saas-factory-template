import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Home Services (Plumber/Electrician)（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #1E40AF / accent #EA580C / surface #EFF6FF。
 * 備註：Professional blue + urgent orange [Accent adjusted from #F97316 for WCAG 3:1]
 */
export const homeServicesPlumberElectrician: DesignTokens = createPreset({
  meta: {
    name: 'home-services-plumber-electrician',
    displayName: 'Home Services (Plumber/Electrician)',
    description: 'Home Services (Plumber/Electrician) — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["consulting"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#1E40AF',
  accentHex: '#EA580C',
  surfaceLight: { hue: 214, sat: 40 },
  surfaceDark: { hue: 214, sat: 30 },
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
