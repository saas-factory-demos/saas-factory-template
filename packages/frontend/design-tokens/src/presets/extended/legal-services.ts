import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Legal Services（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #1E3A8A / accent #B45309 / surface #F8FAFC。
 * 備註：Authority navy + trust gold
 */
export const legalServices: DesignTokens = createPreset({
  meta: {
    name: 'legal-services',
    displayName: 'Legal Services',
    description: 'Legal Services — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["legal-accounting"],
    motionLevelRecommended: 1,
    darkModePrimary: 'both',
  },
  primaryHex: '#1E3A8A',
  accentHex: '#B45309',
  surfaceLight: { hue: 210, sat: 40 },
  surfaceDark: { hue: 210, sat: 30 },
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
  radius: 'subtle',
  motion: { level: 1 },
  density: 'normal',
});
