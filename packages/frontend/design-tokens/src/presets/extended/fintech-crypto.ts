import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Fintech/Crypto（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #F59E0B / accent #8B5CF6 / surface #0F172A。
 * 備註：Gold trust + purple tech
 */
export const fintechCrypto: DesignTokens = createPreset({
  meta: {
    name: 'fintech-crypto',
    displayName: 'Fintech/Crypto',
    description: 'Fintech/Crypto — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["ai-web3"],
    motionLevelRecommended: 3,
    darkModePrimary: 'both',
  },
  primaryHex: '#F59E0B',
  accentHex: '#8B5CF6',
  surfaceLight: { hue: 222, sat: 40 },
  surfaceDark: { hue: 222, sat: 30 },
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
