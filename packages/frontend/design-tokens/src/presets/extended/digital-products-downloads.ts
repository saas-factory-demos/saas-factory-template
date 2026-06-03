import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Digital Products/Downloads（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #6366F1 / accent #16A34A / surface #EEF2FF。
 * 備註：Digital indigo + buy green [Accent adjusted from #22C55E for WCAG 3:1]
 */
export const digitalProductsDownloads: DesignTokens = createPreset({
  meta: {
    name: 'digital-products-downloads',
    displayName: 'Digital Products/Downloads',
    description: 'Digital Products/Downloads — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["consulting"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#6366F1',
  accentHex: '#16A34A',
  surfaceLight: { hue: 226, sat: 40 },
  surfaceDark: { hue: 226, sat: 30 },
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
