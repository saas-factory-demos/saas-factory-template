import {
  INDUSTRIES,
  INDUSTRY_METADATA,
  type Industry,
} from '@saas-factory/factory-types';
import { describe, expect, it } from 'vitest';

import { getIndustryTemplate, mergeWithMetadata } from '../helpers.js';
import { INDUSTRY_TEMPLATES } from '../templates/index.js';

describe('industry templates registry', () => {
  it('33 個 template 全部存在（對齊 INDUSTRIES）', () => {
    expect(Object.keys(INDUSTRY_TEMPLATES)).toHaveLength(33);
    expect(INDUSTRIES).toHaveLength(33);
    for (const industry of INDUSTRIES) {
      expect(INDUSTRY_TEMPLATES[industry]).toBeDefined();
    }
  });

  it('每個 template 的 industry field 對應其 registry key', () => {
    for (const industry of INDUSTRIES) {
      const tpl = INDUSTRY_TEMPLATES[industry];
      expect(tpl.industry).toBe(industry);
    }
  });

  it('每個 template 的 primarySiteType 必為 metadata.recommendedSiteTypes 的一員', () => {
    for (const industry of INDUSTRIES) {
      const tpl = INDUSTRY_TEMPLATES[industry];
      const meta = INDUSTRY_METADATA[industry];
      expect(meta.recommendedSiteTypes).toContain(tpl.primarySiteType);
    }
  });

  it('每個 template 的 pages[primarySiteType] 至少有 1 個 page', () => {
    for (const industry of INDUSTRIES) {
      const tpl = INDUSTRY_TEMPLATES[industry];
      const primaryPages = tpl.pages[tpl.primarySiteType];
      expect(primaryPages.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('每個 page 至少含 4 個 block', () => {
    for (const industry of INDUSTRIES) {
      const tpl = INDUSTRY_TEMPLATES[industry];
      for (const siteType of Object.keys(tpl.pages) as Array<
        keyof typeof tpl.pages
      >) {
        for (const pageComp of tpl.pages[siteType]) {
          expect(pageComp.blocks.length).toBeGreaterThanOrEqual(4);
        }
      }
    }
  });

  it('每個 template 都有完整 copyTone（brandVoice / targetAudience / keySellingPoints）', () => {
    for (const industry of INDUSTRIES) {
      const tpl = INDUSTRY_TEMPLATES[industry];
      expect(tpl.copyTone.brandVoice.length).toBeGreaterThan(0);
      expect(tpl.copyTone.targetAudience.length).toBeGreaterThan(0);
      expect(tpl.copyTone.keySellingPoints.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('getIndustryTemplate 回傳對應 industry 的 template', () => {
    const sample: Industry = 'supplement';
    const tpl = getIndustryTemplate(sample);
    expect(tpl.industry).toBe(sample);
    expect(tpl.primarySiteType).toBe('shop');
  });

  it('mergeWithMetadata 回傳含 recommendedPresetId 與合併後 modules', () => {
    const view = mergeWithMetadata('supplement');
    expect(view.recommendedPresetId).toBe('organic-wellness');
    expect(view.displayName).toBe('保健食品');
    expect(view.primarySiteType).toBe('shop');
    // metadata 已有 shop.subscription，template.extraModules 也含 shop.subscription：應只出現一次
    const occurrences = view.recommendedModules.filter(
      (m) => m === 'shop.subscription',
    );
    expect(occurrences).toHaveLength(1);
    // template.extraModules 獨有的 marketing.line-marketing 應加入
    expect(view.recommendedModules).toContain('marketing.line-marketing');
  });

  it('每個 page 內 block.order 不重複', () => {
    for (const industry of INDUSTRIES) {
      const tpl = INDUSTRY_TEMPLATES[industry];
      for (const siteType of Object.keys(tpl.pages) as Array<
        keyof typeof tpl.pages
      >) {
        for (const pageComp of tpl.pages[siteType]) {
          const orders = pageComp.blocks.map((b) => b.order);
          expect(new Set(orders).size).toBe(orders.length);
        }
      }
    }
  });
});
