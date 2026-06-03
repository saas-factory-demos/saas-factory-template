import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Cybersecurity Platform（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #00FF41 / accent #FF3333 / surface #000000。
 * 備註：Matrix green + alert red
 */
export const cybersecurityPlatform: DesignTokens = createPreset({
  meta: {
    name: 'cybersecurity-platform',
    displayName: 'Cybersecurity Platform',
    description: 'Cybersecurity Platform — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["saas-software"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#00FF41',
  accentHex: '#FF3333',
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
  radius: 'soft',
  motion: { level: 2 },
  density: 'normal',
});
