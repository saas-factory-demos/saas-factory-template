import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * File Manager & Transfer（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #2563EB / accent #D97706 / surface #F8FAFC。
 * 備註：Folder blue + file amber
 */
export const fileManagerAndTransfer: DesignTokens = createPreset({
  meta: {
    name: 'file-manager-and-transfer',
    displayName: 'File Manager & Transfer',
    description: 'File Manager & Transfer — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["consulting"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#2563EB',
  accentHex: '#D97706',
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
