import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Short Video Editor（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #EC4899 / accent #2563EB / surface #0F172A。
 * 備註：Video pink on dark + timeline blue
 */
export const shortVideoEditor: DesignTokens = createPreset({
  meta: {
    name: 'short-video-editor',
    displayName: 'Short Video Editor',
    description: 'Short Video Editor — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["event-conference"],
    motionLevelRecommended: 3,
    darkModePrimary: 'both',
  },
  primaryHex: '#EC4899',
  accentHex: '#2563EB',
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
  motion: { level: 3 },
  density: 'normal',
});
