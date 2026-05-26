import { INDUSTRIES } from '@saas-factory/factory-types';
import { describe, expect, it } from 'vitest';

import { PROMPT_REGISTRY, getIndustryPrompt } from '../prompts/index.js';

describe('PROMPT_REGISTRY', () => {
  it('33 個 industry prompt 全部存在（對齊 INDUSTRIES）', () => {
    expect(Object.keys(PROMPT_REGISTRY)).toHaveLength(33);
    expect(INDUSTRIES).toHaveLength(33);
    for (const key of INDUSTRIES) {
      expect(PROMPT_REGISTRY[key]).toBeDefined();
    }
  });

  it('每個 prompt 的 industry 欄位與 key 一致', () => {
    for (const key of INDUSTRIES) {
      expect(PROMPT_REGISTRY[key].industry).toBe(key);
    }
  });

  it('每個 prompt 含完整 systemPrompt + 6 個 blockPrompts + defaults', () => {
    const blockKeys = ['hero', 'features', 'testimonials', 'pricing', 'faq', 'cta'] as const;
    for (const key of INDUSTRIES) {
      const p = PROMPT_REGISTRY[key];
      expect(p.systemPrompt.length).toBeGreaterThan(100);
      for (const block of blockKeys) {
        expect(p.blockPrompts[block].length).toBeGreaterThan(20);
      }
      expect(p.defaults.brandVoice.length).toBeGreaterThan(0);
      expect(p.defaults.targetAudience.length).toBeGreaterThan(0);
      expect(['professional', 'friendly', 'playful', 'luxurious', 'urgent']).toContain(
        p.defaults.tone,
      );
    }
  });

  it('getIndustryPrompt 取得對應 prompt', () => {
    const prompt = getIndustryPrompt('supplement');
    expect(prompt.industry).toBe('supplement');
    expect(prompt.defaults.tone).toBe('professional');
  });
});
