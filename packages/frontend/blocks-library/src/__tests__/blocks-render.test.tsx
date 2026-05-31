import { FRONTEND_TIER1_BLOCK_KEYS } from '@saas-factory/factory-types';
import { cleanup, render } from '@testing-library/react';
import { createElement } from 'react';
import { afterEach, describe, expect, it } from 'vitest';


import { BLOCK_REGISTRY } from '../registry.js';

afterEach(() => {
  cleanup();
});

/**
 * Smoke 測試：對每個 block 跑「以 defaultConfig 渲染 + 依序切換所有 variant 渲染」。
 *
 * 目標只在驗證：
 * 1. component 可被掛載不丟錯
 * 2. variant 切換時不會 throw（不檢驗視覺差異）
 *
 * 視覺差異留給 Storybook / visual regression 系統。
 */
describe('每個 Tier 1 block 都能用 defaultConfig 渲染', () => {
  for (const key of FRONTEND_TIER1_BLOCK_KEYS) {
    it(`${key}：defaultConfig 渲染不丟錯`, () => {
      const entry = BLOCK_REGISTRY[key];
      const { container } = render(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- registry 內每個 entry 的 component / defaultConfig 同源 z.infer，外層 union 型別會誤判，因此這裡明確擱置
        createElement(entry.component as any, entry.defaultConfig as any),
      );
      expect(container.firstChild).toBeTruthy();
    });
  }
});

describe('每個 Tier 1 block 切換到任一 variant 都能渲染', () => {
  for (const key of FRONTEND_TIER1_BLOCK_KEYS) {
    const entry = BLOCK_REGISTRY[key];
    for (const variant of entry.variants) {
      it(`${key} → ${variant}`, () => {
        const config = { ...(entry.defaultConfig as Record<string, unknown>), variant };
        const parsed = entry.schema.safeParse(config);
        expect(parsed.success, `${key}/${variant} 未通過 schema`).toBe(true);
        if (!parsed.success) return;
        const { container } = render(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- 同上
          createElement(entry.component as any, parsed.data as any),
        );
        expect(container).toBeTruthy();
      });
    }
  }
});
