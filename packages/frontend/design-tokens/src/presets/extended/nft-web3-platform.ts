import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * NFT/Web3 Platform（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #8B5CF6 / accent #FBBF24 / surface #0F0F23。
 * 備註：Purple tech + gold value
 */
export const nftWeb3Platform: DesignTokens = createPreset({
  meta: {
    name: 'nft-web3-platform',
    displayName: 'NFT/Web3 Platform',
    description: 'NFT/Web3 Platform — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["ai-web3"],
    motionLevelRecommended: 3,
    darkModePrimary: 'both',
  },
  primaryHex: '#8B5CF6',
  accentHex: '#FBBF24',
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
  motion: { level: 3 },
  density: 'normal',
});
