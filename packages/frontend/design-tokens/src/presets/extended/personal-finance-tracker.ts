import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Personal Finance Tracker（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #1E40AF / accent #059669 / surface #0F172A。
 * 備註：Trust blue + profit green on dark
 */
export const personalFinanceTracker: DesignTokens = createPreset({
  meta: {
    name: 'personal-finance-tracker',
    displayName: 'Personal Finance Tracker',
    description: 'Personal Finance Tracker — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["personal-brand"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#1E40AF',
  accentHex: '#059669',
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
