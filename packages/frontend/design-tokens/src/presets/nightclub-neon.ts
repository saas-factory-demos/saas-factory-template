import { createPreset } from './_factory.js';

/**
 * 夜店霓虹：純黑底 + 電紫霓虹、最強動畫、glow + perspective。
 */
export const nightclubNeon = createPreset({
  meta: {
    name: 'nightclub-neon',
    displayName: '夜店霓虹',
    description: '純黑 + 電紫霓虹、最強動畫、glow + perspective。夜店 / 酒吧 / 音樂活動。',
    version: '1.0.0',
    recommendedIndustries: ['nightclub-bar'],
    motionLevelRecommended: 5,
    darkModePrimary: 'dark',
  },
  primaryHex: '#0a0a0a',
  accentHex: '#a855f7',
  neutralHex: '#27272a',
  surfaceLight: { hue: 270, sat: 15, fgHue: 270, fgSat: 30, fgLightness: 14 },
  surfaceDark: { hue: 270, sat: 35 },
  typography: {
    fontFamily: {
      sans: "'Space Grotesk', 'Noto Sans TC', system-ui, sans-serif",
      serif: "'Cormorant Garamond', 'Noto Serif TC', serif",
      display: "'Bebas Neue', 'Noto Sans TC', sans-serif",
      mono: "'JetBrains Mono', monospace",
    },
    headingFamily: 'display',
    bodyFamily: 'sans',
    h1Size: '8xl',
    headingWeight: 'normal',
    buttonWeight: 'bold',
    buttonLetterSpacing: 'widest',
  },
  radius: 'sharp',
  shadow: { tint: '168 85 247', strength: 1 },
  motion: { level: 5, customBase: 'all 350ms cubic-bezier(0.68, -0.55, 0.265, 1.55)' },
  density: 'normal',
  interaction: {
    spotlight: true,
    magnetic: true,
    focusRingStyle: 'glow',
    hoverScale: 1.04,
    focusRingColor: 'hsl(var(--color-accent-500) / 0.7)',
  },
  effects: {
    glow: true,
    perspective: true,
    patterns: { grid: true, noise: true },
    glassBlur: 'blur(32px)',
  },
});
