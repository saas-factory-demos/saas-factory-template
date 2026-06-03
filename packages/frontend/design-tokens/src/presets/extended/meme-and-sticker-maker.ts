import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Meme & Sticker Maker（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #EC4899 / accent #2563EB / surface #FFFFFF。
 * 備註：Viral pink + comedy yellow + share blue
 */
export const memeAndStickerMaker: DesignTokens = createPreset({
  meta: {
    name: 'meme-and-sticker-maker',
    displayName: 'Meme & Sticker Maker',
    description: 'Meme & Sticker Maker — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["consulting"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#EC4899',
  accentHex: '#2563EB',
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
