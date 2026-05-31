import { createPreset } from './_factory.js';

/**
 * 雜誌編輯：黑底 + 鮮紅、巨型 serif h1、印刷感版型。
 *
 * 適合印刷設計、雜誌、出版、長文部落格。
 */
export const magazineEditorial = createPreset({
  meta: {
    name: 'magazine-editorial',
    displayName: '雜誌編輯',
    description: '黑 + 鮮紅、巨型 serif、印刷版型。印刷設計 / 雜誌 / 出版。',
    version: '1.0.0',
    recommendedIndustries: ['print-design'],
    motionLevelRecommended: 2,
    darkModePrimary: 'light',
  },
  primaryHex: '#171717',
  accentHex: '#dc2626',
  neutralHex: '#404040',
  surfaceLight: { hue: 0, sat: 0, fgHue: 0, fgSat: 0, fgLightness: 9 },
  typography: {
    fontFamily: {
      sans: "'Inter', 'Noto Sans TC', system-ui, sans-serif",
      serif: "'Playfair Display', 'Noto Serif TC', serif",
      display: "'Playfair Display', 'Noto Serif TC', serif",
      mono: "'JetBrains Mono', monospace",
    },
    headingFamily: 'display',
    bodyFamily: 'serif',
    h1Size: '8xl',
    headingWeight: 'normal',
    buttonWeight: 'bold',
    buttonLetterSpacing: 'wider',
  },
  radius: 'sharp',
  shadow: { tint: '0 0 0', strength: 1 },
  motion: { level: 2 },
  density: 'spacious',
  interaction: { hoverScale: 1.01 },
  effects: {
    patterns: { noise: true },
  },
});
