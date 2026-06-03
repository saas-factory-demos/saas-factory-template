import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Developer Tool / IDE（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #1E293B / accent #22C55E / surface #0F172A。
 * 備註：Code dark + run green
 */
export const developerToolIde: DesignTokens = createPreset({
  meta: {
    name: 'developer-tool-ide',
    displayName: 'Developer Tool / IDE',
    description: 'Developer Tool / IDE — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["saas-software"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#1E293B',
  accentHex: '#22C55E',
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
