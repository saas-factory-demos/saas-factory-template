import { describe, expect, it } from 'vitest';

import { pickLabel, resolveFloatingCta } from './resolver.js';

import type { FloatingCtaConfig, VisibilityInput } from './types.js';

function makeConfig(overrides: Partial<FloatingCtaConfig> = {}): FloatingCtaConfig {
  return {
    tenantId: 't1',
    pageId: 'p1',
    enabled: true,
    desktopPlacement: 'bottom-right-float',
    labels: { 'zh-TW': '立即購買 NT$890', en: 'Buy now $29' },
    targetAnchor: '#checkout',
    hideOnAnchorVisible: true,
    showAfterScrollPx: 300,
    ...overrides,
  };
}

const vis = (overrides: Partial<VisibilityInput> = {}): VisibilityInput => ({
  scrollY: 500,
  anchorInView: false,
  checkoutVisible: false,
  ...overrides,
});

describe('pickLabel', () => {
  it('找到對應 locale', () => {
    expect(pickLabel({ 'zh-TW': 'A', en: 'B' }, 'en')).toBe('B');
  });

  it('fallback 到 zh-TW', () => {
    expect(pickLabel({ 'zh-TW': 'A', en: 'B' }, 'ja')).toBe('A');
  });

  it('空 labels → 預設字串', () => {
    expect(pickLabel({}, 'zh-TW')).toBe('立即購買');
  });
});

describe('resolveFloatingCta - 顯示判斷', () => {
  it('滿足條件 → visible', () => {
    const r = resolveFloatingCta(makeConfig(), 'mobile', 'zh-TW', vis());
    expect(r.visible).toBe(true);
    expect(r.placement).toBe('mobile-bottom-bar');
    expect(r.label).toBe('立即購買 NT$890');
  });

  it('disabled → hidden', () => {
    const r = resolveFloatingCta(makeConfig({ enabled: false }), 'mobile', 'zh-TW', vis());
    expect(r.visible).toBe(false);
    expect(r.reason).toBe('disabled');
  });

  it('scroll 不足 → hidden', () => {
    const r = resolveFloatingCta(makeConfig(), 'desktop', 'zh-TW', vis({ scrollY: 100 }));
    expect(r.visible).toBe(false);
    expect(r.reason).toBe('before-scroll-threshold');
  });

  it('結帳區可見 → 自動隱藏', () => {
    const r = resolveFloatingCta(makeConfig(), 'desktop', 'zh-TW', vis({ checkoutVisible: true }));
    expect(r.visible).toBe(false);
    expect(r.reason).toBe('anchor-in-view');
  });

  it('anchor 可見 → 自動隱藏', () => {
    const r = resolveFloatingCta(makeConfig(), 'desktop', 'zh-TW', vis({ anchorInView: true }));
    expect(r.visible).toBe(false);
  });

  it('hideOnAnchorVisible=false 時忽略 anchor 狀態', () => {
    const r = resolveFloatingCta(
      makeConfig({ hideOnAnchorVisible: false }),
      'desktop',
      'zh-TW',
      vis({ anchorInView: true, checkoutVisible: true }),
    );
    expect(r.visible).toBe(true);
  });

  it('desktop 用 desktopPlacement', () => {
    const r = resolveFloatingCta(
      makeConfig({ desktopPlacement: 'sticky-follow' }),
      'desktop',
      'zh-TW',
      vis(),
    );
    expect(r.placement).toBe('sticky-follow');
  });

  it('英文 locale 拿 en label', () => {
    const r = resolveFloatingCta(makeConfig(), 'mobile', 'en', vis());
    expect(r.label).toBe('Buy now $29');
  });
});
