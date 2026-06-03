import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Gaming（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #7C3AED / accent #F43F5E / surface #0F0F23。
 * 備註：Neon purple + rose action
 */
export const gaming: DesignTokens = createPreset({
  meta: {
    name: 'gaming',
    displayName: 'Gaming',
    description: 'Gaming — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["nightclub-bar"],
    motionLevelRecommended: 5,
    darkModePrimary: 'both',
  },
  primaryHex: '#7C3AED',
  accentHex: '#F43F5E',
  surfaceLight: { hue: 240, sat: 40 },
  surfaceDark: { hue: 240, sat: 30 },
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
  motion: { level: 5 },
  density: 'normal',
});
