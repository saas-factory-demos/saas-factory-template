import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * AI Photo & Avatar Generator（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #7C3AED / accent #EC4899 / surface #FAF5FF。
 * 備註：AI purple + generation pink
 */
export const aiPhotoAndAvatarGenerator: DesignTokens = createPreset({
  meta: {
    name: 'ai-photo-and-avatar-generator',
    displayName: 'AI Photo & Avatar Generator',
    description: 'AI Photo & Avatar Generator — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["ai-web3"],
    motionLevelRecommended: 3,
    darkModePrimary: 'both',
  },
  primaryHex: '#7C3AED',
  accentHex: '#EC4899',
  surfaceLight: { hue: 270, sat: 40 },
  surfaceDark: { hue: 270, sat: 30 },
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
