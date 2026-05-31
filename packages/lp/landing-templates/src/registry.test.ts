import { describe, expect, it } from 'vitest';

import {
  LANDING_TEMPLATES,
  getTemplate,
  instantiateTemplate,
  listCategories,
  listTemplatesByCategory,
} from './registry.js';

describe('landing templates registry', () => {
  it('提供 5 套範本', () => {
    expect(LANDING_TEMPLATES).toHaveLength(5);
  });

  it('每套範本必備欄位齊全', () => {
    for (const t of LANDING_TEMPLATES) {
      expect(t.id).toBeTruthy();
      expect(t.name).toBeTruthy();
      expect(t.description).toBeTruthy();
      expect(t.brandColors.primary).toMatch(/^#[0-9A-Fa-f]{6}$/u);
      expect(t.defaultBlocks.length).toBeGreaterThanOrEqual(8);
    }
  });

  it('每套範本必含 hero 與 checkout-form', () => {
    for (const t of LANDING_TEMPLATES) {
      const types = t.defaultBlocks.map((b) => b.type);
      expect(types).toContain('hero');
      expect(types).toContain('checkout-form');
    }
  });

  it('checkout-form 至少提供 3 個方案（三段式錨定）', () => {
    for (const t of LANDING_TEMPLATES) {
      const checkout = t.defaultBlocks.find((b) => b.type === 'checkout-form');
      expect(checkout).toBeDefined();
      const plans = (checkout?.props.plans ?? []) as Array<{ id: string }>;
      expect(plans.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('id 唯一', () => {
    const ids = LANDING_TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('getTemplate 找得到、找不到時回 undefined', () => {
    expect(getTemplate('supplement-v1')).toBeDefined();
    expect(getTemplate('non-existent')).toBeUndefined();
  });

  it('listTemplatesByCategory 過濾正確', () => {
    expect(listTemplatesByCategory('supplement')).toHaveLength(1);
    expect(listTemplatesByCategory('electronics')).toHaveLength(1);
  });

  it('listCategories 回 5 種', () => {
    expect(new Set(listCategories())).toEqual(
      new Set(['supplement', 'electronics', 'course', 'event', 'service']),
    );
  });

  it('instantiateTemplate 回深拷貝（修改副本不影響原始）', () => {
    const copy = instantiateTemplate('supplement-v1');
    expect(copy).toBeDefined();
    copy!.defaultBlocks[0]!.props.headline = 'modified';
    const original = getTemplate('supplement-v1');
    expect(original?.defaultBlocks[0]?.props.headline).not.toBe('modified');
  });

  it('instantiateTemplate 找不到時回 undefined', () => {
    expect(instantiateTemplate('non-existent')).toBeUndefined();
  });
});
