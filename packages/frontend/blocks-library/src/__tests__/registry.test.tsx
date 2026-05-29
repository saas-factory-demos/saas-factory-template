import { FRONTEND_TIER1_BLOCK_KEYS } from '@saas-factory/factory-types';
import { describe, expect, it } from 'vitest';


import { BLOCK_KEYS, BLOCK_REGISTRY } from '../registry.js';

describe('BLOCK_REGISTRY', () => {
  it('涵蓋全部 20 個 Tier 1 block key', () => {
    const keys = Object.keys(BLOCK_REGISTRY).sort();
    const expected = [...FRONTEND_TIER1_BLOCK_KEYS].sort();
    expect(keys).toEqual(expected);
  });

  it('BLOCK_KEYS 與 factory-types 完全一致', () => {
    expect([...BLOCK_KEYS]).toEqual([...FRONTEND_TIER1_BLOCK_KEYS]);
  });

  it('每個 entry 都有 schema / component / displayName / variants / defaultConfig', () => {
    for (const key of FRONTEND_TIER1_BLOCK_KEYS) {
      const entry = BLOCK_REGISTRY[key];
      expect(entry, `${key} entry 缺失`).toBeDefined();
      expect(entry.schema, `${key} schema 缺失`).toBeDefined();
      expect(typeof entry.component, `${key} component 必須是 function`).toBe('function');
      expect(entry.displayName.length, `${key} displayName 為空`).toBeGreaterThan(0);
      expect(entry.variants.length, `${key} variants 為空`).toBeGreaterThanOrEqual(5);
      expect(entry.variants.length, `${key} variants 超過 8 個`).toBeLessThanOrEqual(8);
      expect(entry.defaultConfig, `${key} defaultConfig 缺失`).toBeDefined();
    }
  });

  it('每個 entry 的 defaultConfig 都通過自身 schema 驗證', () => {
    for (const key of FRONTEND_TIER1_BLOCK_KEYS) {
      const entry = BLOCK_REGISTRY[key];
      const result = entry.schema.safeParse(entry.defaultConfig);
      if (!result.success) {
        throw new Error(`${key} defaultConfig 未通過 schema：${result.error.message}`);
      }
      expect(result.success).toBe(true);
    }
  });

  it('每個 entry 的 defaultConfig.variant 必須屬於 variants 列表', () => {
    for (const key of FRONTEND_TIER1_BLOCK_KEYS) {
      const entry = BLOCK_REGISTRY[key];
      const config = entry.defaultConfig as { variant?: string };
      expect(entry.variants).toContain(config.variant);
    }
  });
});
