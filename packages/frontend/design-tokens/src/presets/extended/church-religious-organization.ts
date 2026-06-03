import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Church/Religious Organization（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #7C3AED / accent #A16207 / surface #FAF5FF。
 * 備註：Spiritual purple + warm gold [Accent adjusted from #CA8A04 for WCAG 3:1]
 */
export const churchReligiousOrganization: DesignTokens = createPreset({
  meta: {
    name: 'church-religious-organization',
    displayName: 'Church/Religious Organization',
    description: 'Church/Religious Organization — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["church-religion"],
    motionLevelRecommended: 1,
    darkModePrimary: 'both',
  },
  primaryHex: '#7C3AED',
  accentHex: '#A16207',
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
  motion: { level: 1 },
  density: 'normal',
});
