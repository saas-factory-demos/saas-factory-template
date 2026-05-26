import { createPreset } from './_factory.js';

/**
 * 醫療專業：淺藍 + 青、克制裝飾、極低動畫、信任感。
 *
 * 適合牙醫、診所、護理機構。
 */
export const medicalClinical = createPreset({
  meta: {
    name: 'medical-clinical',
    displayName: '醫療專業',
    description: '淺藍 + 青、克制裝飾、極低動畫、信任感。牙醫 / 診所 / 護理。',
    version: '1.0.0',
    recommendedIndustries: ['dental-clinic'],
    motionLevelRecommended: 1,
    darkModePrimary: 'both',
  },
  primaryHex: '#0284c7',
  accentHex: '#14b8a6',
  neutralHex: '#475569',
  surfaceLight: { hue: 200, sat: 15, fgHue: 210, fgSat: 30, fgLightness: 14 },
  surfaceDark: { hue: 210, sat: 30 },
  typography: {
    fontFamily: {
      sans: "'Inter', 'Noto Sans TC', system-ui, sans-serif",
      serif: "'Source Serif Pro', 'Noto Serif TC', serif",
      display: "'Inter', 'Noto Sans TC', system-ui, sans-serif",
      mono: "'JetBrains Mono', monospace",
    },
    headingFamily: 'sans',
    bodyFamily: 'sans',
    headingWeight: 'semibold',
    buttonWeight: 'medium',
  },
  radius: 'soft',
  shadow: { tint: '2 132 199', strength: 0.5 },
  motion: { level: 1 },
  density: 'normal',
  interaction: { hoverScale: 1.01 },
});
