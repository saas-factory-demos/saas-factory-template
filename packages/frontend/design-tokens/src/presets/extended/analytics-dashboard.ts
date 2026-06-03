import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Analytics Dashboard（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #1E40AF / accent #D97706 / surface #F8FAFC。
 * 備註：Blue data + amber highlights [Accent adjusted from #F59E0B for WCAG 3:1]
 */
export const analyticsDashboard: DesignTokens = createPreset({
  meta: {
    name: 'analytics-dashboard',
    displayName: 'Analytics Dashboard',
    description: 'Analytics Dashboard — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["saas-software"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#1E40AF',
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
