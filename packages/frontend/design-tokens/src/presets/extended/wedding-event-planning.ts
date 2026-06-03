import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Wedding/Event Planning（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #DB2777 / accent #A16207 / surface #FDF2F8。
 * 備註：Romantic pink + elegant gold [Accent adjusted from #CA8A04 for WCAG 3:1]
 */
export const weddingEventPlanning: DesignTokens = createPreset({
  meta: {
    name: 'wedding-event-planning',
    displayName: 'Wedding/Event Planning',
    description: 'Wedding/Event Planning — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["wedding"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#DB2777',
  accentHex: '#A16207',
  surfaceLight: { hue: 327, sat: 40 },
  surfaceDark: { hue: 327, sat: 30 },
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
  radius: 'plush',
  motion: { level: 2 },
  density: 'normal',
});
