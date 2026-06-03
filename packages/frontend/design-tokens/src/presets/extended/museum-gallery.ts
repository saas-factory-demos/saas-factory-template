import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Museum/Gallery（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #18181B / accent #18181B / surface #FAFAFA。
 * 備註：Gallery black + white space [Accent adjusted from #F8FAFC for WCAG 3:1]
 */
export const museumGallery: DesignTokens = createPreset({
  meta: {
    name: 'museum-gallery',
    displayName: 'Museum/Gallery',
    description: 'Museum/Gallery — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["consulting"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#18181B',
  accentHex: '#18181B',
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
