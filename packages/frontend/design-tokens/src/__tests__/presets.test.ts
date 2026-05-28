import { PRESET_KEYS } from '@saas-factory/factory-types';
import { describe, expect, it } from 'vitest';

import { PRESET_LIST, presets } from '../presets/index.js';

describe('preset registry', () => {
  it('20 套 preset 全部存在（對齊 PRESET_KEYS）', () => {
    expect(Object.keys(presets)).toHaveLength(20);
    expect(PRESET_KEYS).toHaveLength(20);
    for (const key of PRESET_KEYS) {
      expect(presets[key]).toBeDefined();
    }
  });

  it('每個 preset 有完整 meta', () => {
    for (const key of PRESET_KEYS) {
      const p = presets[key];
      expect(p.meta.name).toBe(key);
      expect(p.meta.displayName.length).toBeGreaterThan(0);
      expect(p.meta.description.length).toBeGreaterThan(0);
      expect(p.meta.recommendedIndustries.length).toBeGreaterThan(0);
      expect([1, 2, 3, 4, 5]).toContain(p.meta.motionLevelRecommended);
    }
  });

  it('每個 preset 都含五階段 radius（ADR 0015 backward-compat）', () => {
    for (const key of PRESET_KEYS) {
      const r = presets[key].radius;
      expect(r.sm).toBeTruthy();
      expect(r.md).toBeTruthy();
      expect(r.lg).toBeTruthy();
      expect(r.xl).toBeTruthy();
      expect(r['2xl']).toBeTruthy();
    }
  });

  it('每個 preset radius.sm 不為 0（不允許「無圓角」風格）', () => {
    for (const key of PRESET_KEYS) {
      const sm = presets[key].radius.sm;
      expect(sm).not.toBe('0');
      expect(sm).not.toBe('0rem');
    }
  });

  it('PRESET_LIST 與 PRESET_KEYS 數量一致', () => {
    expect(PRESET_LIST).toHaveLength(PRESET_KEYS.length);
  });

  it('每個 preset 11 個 category 都有值', () => {
    const categories = [
      'meta',
      'colors',
      'typography',
      'radius',
      'spacing',
      'shadow',
      'motion',
      'density',
      'interaction',
      'effects',
      'breakpoints',
    ] as const;
    for (const key of PRESET_KEYS) {
      const p = presets[key];
      for (const cat of categories) {
        expect(p[cat]).toBeDefined();
      }
    }
  });

  it('每個 preset 都有 11 階 primary color scale', () => {
    const scaleKeys = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
    for (const key of PRESET_KEYS) {
      const primary = presets[key].colors.primary;
      for (const sk of scaleKeys) {
        expect(primary[sk]).toMatch(/^-?\d+ \d+% \d+%$/);
      }
    }
  });

  it('darkModePrimary 為 both / dark 的 preset 必須含 colors.dark', () => {
    for (const key of PRESET_KEYS) {
      const p = presets[key];
      if (p.meta.darkModePrimary === 'both' || p.meta.darkModePrimary === 'dark') {
        expect(p.colors.dark).toBeDefined();
      }
    }
  });
});
