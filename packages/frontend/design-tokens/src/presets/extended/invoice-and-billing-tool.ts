import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Invoice & Billing Tool（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #1E3A5F / accent #059669 / surface #F8FAFC。
 * 備註：Navy professional + paid green
 */
export const invoiceAndBillingTool: DesignTokens = createPreset({
  meta: {
    name: 'invoice-and-billing-tool',
    displayName: 'Invoice & Billing Tool',
    description: 'Invoice & Billing Tool — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["saas-software"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#1E3A5F',
  accentHex: '#059669',
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
