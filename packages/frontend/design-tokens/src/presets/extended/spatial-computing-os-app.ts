import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Spatial Computing OS / App（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #FFFFFF / accent #FFFFFF / surface #888888。
 * 備註：Glass white + system blue [Accent adjusted from #007AFF for WCAG 3:1]
 */
export const spatialComputingOsApp: DesignTokens = createPreset({
  meta: {
    name: 'spatial-computing-os-app',
    displayName: 'Spatial Computing OS / App',
    description: 'Spatial Computing OS / App — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["beauty-skincare","salon"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#FFFFFF',
  accentHex: '#FFFFFF',
  surfaceLight: { hue: 0, sat: 0 },
  surfaceDark: { hue: 0, sat: 0 },
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
