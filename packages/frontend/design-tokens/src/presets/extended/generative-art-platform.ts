import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Generative Art Platform（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #18181B / accent #EC4899 / surface #FAFAFA。
 * 備註：Canvas neutral + creative pink
 */
export const generativeArtPlatform: DesignTokens = createPreset({
  meta: {
    name: 'generative-art-platform',
    displayName: 'Generative Art Platform',
    description: 'Generative Art Platform — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["ai-web3"],
    motionLevelRecommended: 3,
    darkModePrimary: 'both',
  },
  primaryHex: '#18181B',
  accentHex: '#EC4899',
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
  motion: { level: 3 },
  density: 'normal',
});
