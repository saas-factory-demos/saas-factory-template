import { createPreset } from './_factory.js';

/**
 * 學院溫暖：橘 + 青、serif 標題 + sans 內文，課程平台氛圍。
 */
export const academyWarm = createPreset({
  meta: {
    name: 'academy-warm',
    displayName: '學院溫暖',
    description: '暖橘 + 青、serif 標題 sans 內文、適中圓角。線上課程 / 教育平台。',
    version: '1.0.0',
    recommendedIndustries: ['online-course'],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#ea580c',
  accentHex: '#14b8a6',
  neutralHex: '#57534e',
  surfaceLight: { hue: 30, sat: 25, fgHue: 24, fgSat: 30, fgLightness: 14 },
  surfaceDark: { hue: 24, sat: 25 },
  typography: {
    fontFamily: {
      sans: "'Inter', 'Noto Sans TC', system-ui, sans-serif",
      serif: "'Lora', 'Noto Serif TC', serif",
      display: "'Fraunces', 'Noto Serif TC', serif",
      mono: "'JetBrains Mono', monospace",
    },
    headingFamily: 'display',
    bodyFamily: 'sans',
    headingWeight: 'semibold',
    buttonWeight: 'semibold',
  },
  radius: 'soft',
  shadow: { tint: '234 88 12', strength: 0.7 },
  motion: { level: 2 },
  density: 'normal',
  interaction: { hoverScale: 1.02 },
});
