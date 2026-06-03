import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Coworking Space（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #F59E0B / accent #2563EB / surface #FFFBEB。
 * 備註：Energetic amber + booking blue
 */
export const coworkingSpace: DesignTokens = createPreset({
  meta: {
    name: 'coworking-space',
    displayName: 'Coworking Space',
    description: 'Coworking Space — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["beauty-skincare","salon"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#F59E0B',
  accentHex: '#2563EB',
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
