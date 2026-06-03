import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Autonomous Drone Fleet Manager（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #00FF41 / accent #FF3333 / surface #0D1117。
 * 備註：Terminal green + alert red
 */
export const autonomousDroneFleetManager: DesignTokens = createPreset({
  meta: {
    name: 'autonomous-drone-fleet-manager',
    displayName: 'Autonomous Drone Fleet Manager',
    description: 'Autonomous Drone Fleet Manager — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["manufacturing"],
    motionLevelRecommended: 1,
    darkModePrimary: 'both',
  },
  primaryHex: '#00FF41',
  accentHex: '#FF3333',
  surfaceLight: { hue: 216, sat: 28 },
  surfaceDark: { hue: 216, sat: 28 },
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
  radius: 'subtle',
  motion: { level: 1 },
  density: 'normal',
});
