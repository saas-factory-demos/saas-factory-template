import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Voice Recorder & Memo（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #DC2626 / accent #2563EB / surface #FFFFFF。
 * 備註：Recording red + waveform blue
 */
export const voiceRecorderAndMemo: DesignTokens = createPreset({
  meta: {
    name: 'voice-recorder-and-memo',
    displayName: 'Voice Recorder & Memo',
    description: 'Voice Recorder & Memo — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["consulting"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#DC2626',
  accentHex: '#2563EB',
  surfaceLight: { hue: 0, sat: 0 },
  surfaceDark: { hue: 0, sat: 0 },
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
