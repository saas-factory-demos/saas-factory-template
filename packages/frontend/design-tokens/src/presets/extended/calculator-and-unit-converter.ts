import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Calculator & Unit Converter（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #EA580C / accent #2563EB / surface #1C1917。
 * 備註：Operation orange on dark
 */
export const calculatorAndUnitConverter: DesignTokens = createPreset({
  meta: {
    name: 'calculator-and-unit-converter',
    displayName: 'Calculator & Unit Converter',
    description: 'Calculator & Unit Converter — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["consulting"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#EA580C',
  accentHex: '#2563EB',
  surfaceLight: { hue: 24, sat: 10 },
  surfaceDark: { hue: 24, sat: 10 },
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
