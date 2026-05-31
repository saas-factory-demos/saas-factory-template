import { createPreset } from './_factory.js';

/**
 * 職人手作：陶土 + 芥末、手寫字、紙質紋路。
 *
 * 適合手工藝、設計工坊、獨立品牌。
 */
export const artisanCraft = createPreset({
  meta: {
    name: 'artisan-craft',
    displayName: '職人手作',
    description: '陶土 + 芥末、手寫字點綴、紙質感。手工藝 / 設計工坊 / 獨立品牌。',
    version: '1.0.0',
    recommendedIndustries: ['craft-design'],
    motionLevelRecommended: 2,
    darkModePrimary: 'light',
  },
  primaryHex: '#7c2d12',
  accentHex: '#a16207',
  neutralHex: '#57534e',
  surfaceLight: { hue: 30, sat: 25, fgHue: 20, fgSat: 25, fgLightness: 13 },
  typography: {
    fontFamily: {
      sans: "'Karla', 'Noto Sans TC', system-ui, sans-serif",
      serif: "'Lora', 'Noto Serif TC', serif",
      display: "'Fraunces', 'Noto Serif TC', serif",
      mono: "'JetBrains Mono', monospace",
      handwriting: "'Caveat', cursive",
    },
    headingFamily: 'display',
    bodyFamily: 'serif',
    h1Size: '6xl',
    headingWeight: 'semibold',
    buttonWeight: 'semibold',
  },
  radius: 'soft',
  shadow: { tint: '124 45 18', strength: 0.7 },
  motion: { level: 2 },
  density: 'normal',
  effects: {
    patterns: { noise: true },
  },
});
