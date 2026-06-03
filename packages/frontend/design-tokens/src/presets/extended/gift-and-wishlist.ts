import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Gift & Wishlist（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #DC2626 / accent #EC4899 / surface #FFF1F2。
 * 備註：Gift red + gold + surprise pink
 */
export const giftAndWishlist: DesignTokens = createPreset({
  meta: {
    name: 'gift-and-wishlist',
    displayName: 'Gift & Wishlist',
    description: 'Gift & Wishlist — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["consulting"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#DC2626',
  accentHex: '#EC4899',
  surfaceLight: { hue: 356, sat: 40 },
  surfaceDark: { hue: 356, sat: 30 },
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
