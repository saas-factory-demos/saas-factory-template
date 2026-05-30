import { createPreset } from './_factory.js';

/**
 * 神聖寧靜：暖金 + 米白、serif、低動畫、留白氛圍。
 */
export const sacredSerenity = createPreset({
  meta: {
    name: 'sacred-serenity',
    displayName: '神聖寧靜',
    description: '暖金 + 米白、serif、低動畫、留白氛圍。宗教信仰 / 冥想 / 瑜珈中心。',
    version: '1.0.0',
    recommendedIndustries: ['church-religion'],
    motionLevelRecommended: 1,
    darkModePrimary: 'light',
  },
  primaryHex: '#a16207',
  accentHex: '#c2410c',
  neutralHex: '#57534e',
  surfaceLight: { hue: 45, sat: 30, fgHue: 30, fgSat: 25, fgLightness: 14 },
  typography: {
    fontFamily: {
      sans: "'Manrope', 'Noto Sans TC', system-ui, sans-serif",
      serif: "'Cormorant Garamond', 'Noto Serif TC', serif",
      display: "'Cormorant Garamond', 'Noto Serif TC', serif",
      mono: "'JetBrains Mono', monospace",
    },
    headingFamily: 'display',
    bodyFamily: 'serif',
    h1Size: '6xl',
    headingWeight: 'normal',
    buttonWeight: 'medium',
    buttonLetterSpacing: 'wider',
  },
  radius: 'plush',
  shadow: { tint: '161 98 7', strength: 0.5 },
  motion: { level: 1 },
  density: 'spacious',
  interaction: { hoverScale: 1.01 },
});
