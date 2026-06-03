import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Photo Editor & Filters（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #7C3AED / accent #0891B2 / surface #0F172A。
 * 備註：Editor violet + filter cyan on dark
 */
export const photoEditorAndFilters: DesignTokens = createPreset({
  meta: {
    name: 'photo-editor-and-filters',
    displayName: 'Photo Editor & Filters',
    description: 'Photo Editor & Filters — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["craft-design"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#7C3AED',
  accentHex: '#0891B2',
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
  motion: { level: 2 },
  density: 'normal',
});
