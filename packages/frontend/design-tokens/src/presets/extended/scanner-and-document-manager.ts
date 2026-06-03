import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Scanner & Document Manager（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #1E293B / accent #2563EB / surface #F8FAFC。
 * 備註：Document grey + scan blue
 */
export const scannerAndDocumentManager: DesignTokens = createPreset({
  meta: {
    name: 'scanner-and-document-manager',
    displayName: 'Scanner & Document Manager',
    description: 'Scanner & Document Manager — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["consulting"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#1E293B',
  accentHex: '#2563EB',
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
  radius: 'soft',
  motion: { level: 2 },
  density: 'normal',
});
