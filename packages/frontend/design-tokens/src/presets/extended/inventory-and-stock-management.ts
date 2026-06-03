import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Inventory & Stock Management（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #334155 / accent #059669 / surface #F8FAFC。
 * 備註：Industrial slate + stock green
 */
export const inventoryAndStockManagement: DesignTokens = createPreset({
  meta: {
    name: 'inventory-and-stock-management',
    displayName: 'Inventory & Stock Management',
    description: 'Inventory & Stock Management — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["consulting"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#334155',
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
