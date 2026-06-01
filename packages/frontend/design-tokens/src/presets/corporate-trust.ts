import { createPreset } from './_factory.js';

/**
 * 企業沉穩：海軍藍主、克制裝飾、暗色友善。
 *
 * 適合顧問、製造、物流貿易、法律會計等企業 B2B。
 */
export const corporateTrust = createPreset({
  meta: {
    name: 'corporate-trust',
    displayName: '企業沉穩',
    description: '深藍主色、sans 字體、克制裝飾、雙模式支援。顧問 / 製造 / 物流 / 法務。',
    version: '1.0.0',
    recommendedIndustries: ['consulting', 'manufacturing', 'logistics-trade', 'legal-accounting'],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#1e3a8a',
  accentHex: '#0ea5e9',
  neutralHex: '#475569',
  surfaceLight: { hue: 220, sat: 15, fgHue: 222, fgSat: 47, fgLightness: 11 },
  surfaceDark: { hue: 222, sat: 47 },
  typography: {
    fontFamily: {
      sans: "'Inter', 'Noto Sans TC', system-ui, sans-serif",
      serif: "'Source Serif Pro', 'Noto Serif TC', serif",
      display: "'Inter', 'Noto Sans TC', system-ui, sans-serif",
      mono: "'JetBrains Mono', monospace",
    },
    headingFamily: 'sans',
    bodyFamily: 'sans',
    headingWeight: 'bold',
    buttonWeight: 'medium',
  },
  radius: 'subtle',
  motion: { level: 2 },
  density: 'normal',
  interaction: { hoverScale: 1.01 },
});
