import { createPreset } from './_factory.js';

/**
 * 旅行逃離：天空藍 + 夕陽橘、display sans、輕盈。
 */
export const travelEscape = createPreset({
  meta: {
    name: 'travel-escape',
    displayName: '旅行逃離',
    description: '天空藍 + 夕陽橘、display sans、輕盈感。旅遊行程 / 民宿 / 旅行社。',
    version: '1.0.0',
    recommendedIndustries: ['travel-tour'],
    motionLevelRecommended: 3,
    darkModePrimary: 'light',
  },
  primaryHex: '#0284c7',
  accentHex: '#f97316',
  neutralHex: '#475569',
  surfaceLight: { hue: 200, sat: 30, fgHue: 210, fgSat: 30, fgLightness: 13 },
  typography: {
    fontFamily: {
      sans: "'Plus Jakarta Sans', 'Noto Sans TC', system-ui, sans-serif",
      serif: "'Lora', 'Noto Serif TC', serif",
      display: "'Fraunces', 'Noto Serif TC', serif",
      mono: "'JetBrains Mono', monospace",
    },
    headingFamily: 'display',
    bodyFamily: 'sans',
    h1Size: '6xl',
    headingWeight: 'semibold',
    buttonWeight: 'semibold',
  },
  radius: 'soft',
  shadow: { tint: '2 132 199', strength: 0.6 },
  motion: { level: 3 },
  density: 'normal',
  interaction: { hoverScale: 1.03 },
  effects: {
    glow: false,
    patterns: { waves: true },
  },
});
