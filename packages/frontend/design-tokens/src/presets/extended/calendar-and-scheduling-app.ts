import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Calendar & Scheduling App（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #2563EB / accent #059669 / surface #F8FAFC。
 * 備註：Calendar blue + event green
 */
export const calendarAndSchedulingApp: DesignTokens = createPreset({
  meta: {
    name: 'calendar-and-scheduling-app',
    displayName: 'Calendar & Scheduling App',
    description: 'Calendar & Scheduling App — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["consulting"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#2563EB',
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
