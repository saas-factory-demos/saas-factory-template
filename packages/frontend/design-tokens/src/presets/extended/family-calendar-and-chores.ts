import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Family Calendar & Chores（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #2563EB / accent #D97706 / surface #F8FAFC。
 * 備註：Family blue + chore green
 */
export const familyCalendarAndChores: DesignTokens = createPreset({
  meta: {
    name: 'family-calendar-and-chores',
    displayName: 'Family Calendar & Chores',
    description: 'Family Calendar & Chores — ui-ux-pro-max 擴充 palette',
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
