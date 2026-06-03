import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Emergency SOS & Safety（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #DC2626 / accent #2563EB / surface #FFF1F2。
 * 備註：Alert red + safety blue
 */
export const emergencySosAndSafety: DesignTokens = createPreset({
  meta: {
    name: 'emergency-sos-and-safety',
    displayName: 'Emergency SOS & Safety',
    description: 'Emergency SOS & Safety — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["consulting"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#DC2626',
  accentHex: '#2563EB',
  surfaceLight: { hue: 356, sat: 40 },
  surfaceDark: { hue: 356, sat: 30 },
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
