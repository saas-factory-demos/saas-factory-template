import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Diary & Journal App（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #92400E / accent #6366F1 / surface #FFFBEB。
 * 備註：Warm journal brown + ink violet
 */
export const diaryAndJournalApp: DesignTokens = createPreset({
  meta: {
    name: 'diary-and-journal-app',
    displayName: 'Diary & Journal App',
    description: 'Diary & Journal App — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["consulting"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#92400E',
  accentHex: '#6366F1',
  surfaceLight: { hue: 48, sat: 40 },
  surfaceDark: { hue: 48, sat: 30 },
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
