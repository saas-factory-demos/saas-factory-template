import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Expense Splitter / Bill Split（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #059669 / accent #DC2626 / surface #F8FAFC。
 * 備註：Balance green + owe red
 */
export const expenseSplitterBillSplit: DesignTokens = createPreset({
  meta: {
    name: 'expense-splitter-bill-split',
    displayName: 'Expense Splitter / Bill Split',
    description: 'Expense Splitter / Bill Split — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["consulting"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#059669',
  accentHex: '#DC2626',
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
