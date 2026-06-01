import { describe, expect, it } from 'vitest';

import {
  DEFAULT_IMAGE_BUDGET_USD,
  FALLBACK_IMAGE_PRICE_USD,
  ImageBudgetExceededError,
  ImageBudgetTracker,
  aspectRatioForSlot,
  aspectScore,
  buildImagePrompt,
  buildStyleProfile,
  collectImageSlots,
  estimateBytesFromB64,
  getImagePriceUsd,
  pickBestImage,
  scoreImages,
} from '../index.js';

import { PAGE_WITH_IMAGES, makeWizard } from './fixtures.js';

import type { ImageGenRequest, ImageGenResult } from '../index.js';

describe('buildStyleProfile', () => {
  it('從 wizard theme / industry 抽出風格描述 + preset 對應 mood', () => {
    const profile = buildStyleProfile(makeWizard());
    expect(profile.industry).toBe('restaurant');
    expect(profile.preset).toBe('culinary-warmth');
    expect(profile.primaryColor).toBe('#B8442A');
    expect(profile.mood).toContain('appetizing');
  });

  it('未知 / 一般 preset 走 fallback mood', () => {
    const profile = buildStyleProfile(makeWizard({ theme: { presetId: 'modern-minimal' } }));
    expect(profile.mood).toContain('minimalist');
  });
});

describe('buildImagePrompt', () => {
  it('hero slot → 16:9 + 含主題 / 產業 / 取景 / 配色', () => {
    const profile = buildStyleProfile(makeWizard());
    const built = buildImagePrompt({ slotKind: 'hero-background', subject: '招牌料理', styleProfile: profile });
    expect(built.aspectRatio).toBe('16:9');
    expect(built.prompt).toContain('招牌料理');
    expect(built.prompt).toContain('餐飲');
    expect(built.prompt).toContain('#B8442A');
    expect(built.prompt.toLowerCase()).toContain('hero');
    expect(built.negativePrompt).toContain('watermark');
  });

  it('feature-icon slot → 1:1 + icon 取景', () => {
    const profile = buildStyleProfile(makeWizard());
    const built = buildImagePrompt({ slotKind: 'feature-icon', styleProfile: profile });
    expect(built.aspectRatio).toBe('1:1');
    expect(built.prompt.toLowerCase()).toContain('icon');
  });

  it('dark mode → 低調光氛圍詞', () => {
    const profile = buildStyleProfile(makeWizard({ theme: { darkMode: 'dark' } }));
    const built = buildImagePrompt({ slotKind: 'generic', styleProfile: profile });
    expect(built.prompt.toLowerCase()).toContain('moody');
  });

  it('aspectRatioForSlot 對照正確', () => {
    expect(aspectRatioForSlot('portrait')).toBe('3:4');
    expect(aspectRatioForSlot('gallery')).toBe('4:3');
  });
});

describe('collectImageSlots', () => {
  it('掃出所有可見 block 的 image asset + 推斷 slot 類型', () => {
    const slots = collectImageSlots([PAGE_WITH_IMAGES]);
    // hero 背景 + 2 個 feature icon + 1 個 gallery = 4（隱藏 block 不算）
    expect(slots).toHaveLength(4);
    const hero = slots.find((s) => s.blockId === 'b-hero');
    expect(hero?.slotKind).toBe('hero-background');
    expect(hero?.subject).toBe('餐廳內景');
    expect(hero?.path).toEqual(['backgroundImage']);

    const featSlots = slots.filter((s) => s.blockId === 'b-feat');
    expect(featSlots).toHaveLength(2);
    expect(featSlots[0]?.slotKind).toBe('feature-icon');
    expect(featSlots[0]?.path).toEqual(['items', 0, 'icon']);

    const gallery = slots.find((s) => s.blockId === 'b-gallery');
    expect(gallery?.slotKind).toBe('gallery');
    expect(gallery?.path).toEqual(['images', 0]);
  });

  it('隱藏 block（visible=false）不掃', () => {
    const slots = collectImageSlots([PAGE_WITH_IMAGES]);
    expect(slots.some((s) => s.blockId === 'b-hidden')).toBe(false);
  });
});

describe('budget', () => {
  it('getImagePriceUsd：已知 model 取表值，未知走 fallback', () => {
    expect(getImagePriceUsd('mock')).toBe(0);
    expect(getImagePriceUsd('gpt-image-2')).toBeGreaterThan(0);
    expect(getImagePriceUsd('未知-model')).toBe(FALLBACK_IMAGE_PRICE_USD);
  });

  it('assertWithinBudget：超支 throw ImageBudgetExceededError', () => {
    const tracker = new ImageBudgetTracker({ maxUsd: 0.5 });
    expect(() => tracker.assertWithinBudget(0.3)).not.toThrow();
    tracker.recordActual(0.3);
    expect(() => tracker.assertWithinBudget(0.3)).toThrow(ImageBudgetExceededError);
    expect(tracker.getUsedUsd()).toBeCloseTo(0.3);
    expect(tracker.getRemainingUsd()).toBeCloseTo(0.2);
  });

  it('預設每站上限 = $2', () => {
    expect(DEFAULT_IMAGE_BUDGET_USD).toBe(2);
  });
});

describe('curator', () => {
  const req: ImageGenRequest = { prompt: 'x', aspectRatio: '16:9', count: 3 };
  const mk = (b64: string, width?: number, height?: number): ImageGenResult => ({
    b64,
    mimeType: 'image/png',
    model: 'mock',
    costUsd: 0,
    width,
    height,
  });

  it('estimateBytesFromB64 估算合理（含 padding）', () => {
    expect(estimateBytesFromB64('')).toBe(0);
    expect(estimateBytesFromB64('AAAA')).toBe(3);
    expect(estimateBytesFromB64('AAA=')).toBe(2);
  });

  it('aspectScore：比例完美命中 = 1，缺尺寸 = 0.5', () => {
    expect(aspectScore(mk('AAAA', 1600, 900), '16:9')).toBeCloseTo(1);
    expect(aspectScore(mk('AAAA'), '16:9')).toBe(0.5);
  });

  it('pickBestImage：比例相同時取 byte 較多者', () => {
    const results = [mk('AAAA', 1600, 900), mk('AAAAAAAAAAAA', 1600, 900)];
    const best = pickBestImage(results, req);
    expect(best.b64).toBe('AAAAAAAAAAAA');
  });

  it('scoreImages：回每張評分明細', () => {
    const scores = scoreImages([mk('AAAA', 1600, 900)], req);
    expect(scores[0]?.aspect).toBeCloseTo(1);
    expect(scores[0]?.score).toBeGreaterThan(0);
  });
});
