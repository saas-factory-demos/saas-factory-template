import { describe, expect, it } from 'vitest';

import {
  blockInstanceToPayloadBlock,
  pageCompositionsToPayloadPages,
} from './payload-seed.js';

import type { BlockInstance, PageComposition } from '@saas-factory/factory-types';

const HERO: BlockInstance = {
  id: 'b1',
  type: 'hero',
  variant: 'centered',
  config: { headline: '歡迎', subheadline: '副標' },
  visible: true,
  order: 0,
};

const FEATURES: BlockInstance = {
  id: 'b2',
  type: 'features-grid',
  variant: 'grid',
  config: { items: [{ title: 'A' }] },
  visible: true,
  order: 1,
};

describe('blockInstanceToPayloadBlock', () => {
  it('type → blockType；config 攤平到頂層', () => {
    const result = blockInstanceToPayloadBlock(HERO);
    expect(result).toEqual({
      id: 'b1',
      blockType: 'hero',
      variant: 'centered',
      visible: true,
      headline: '歡迎',
      subheadline: '副標',
    });
  });

  it('config 巢狀物件保留（features 的 items[]）', () => {
    const result = blockInstanceToPayloadBlock(FEATURES);
    expect(result.items).toEqual([{ title: 'A' }]);
    expect(result.blockType).toBe('features-grid');
  });

  it('與 mapPayloadLayoutToBlocks 互為鏡像（round-trip）', async () => {
    const { mapPayloadLayoutToBlocks } = await import('./payload-pages.js');
    const payloadDoc = blockInstanceToPayloadBlock(HERO);
    const roundTrip = mapPayloadLayoutToBlocks([payloadDoc])[0];
    expect(roundTrip).toEqual({
      id: 'b1',
      type: 'hero',
      variant: 'centered',
      config: { headline: '歡迎', subheadline: '副標' },
      visible: true,
      order: 0,
    });
  });
});

describe('pageCompositionsToPayloadPages', () => {
  const compositions: PageComposition[] = [
    { pageKey: 'homepage', blocks: [HERO, FEATURES] },
    { pageKey: 'about', blocks: [HERO] },
    { pageKey: 'product-list', blocks: [] },
  ];

  it('homepage → slug=home, isHomepage=true, sortOrder=0', () => {
    const result = pageCompositionsToPayloadPages('tenant-1', compositions);
    const home = result[0]!;
    expect(home.slug).toBe('home');
    expect(home.isHomepage).toBe(true);
    expect(home.sortOrder).toBe(0);
    expect(home.title).toBe('Homepage');
  });

  it('非 homepage → slug=pageKey, isHomepage=false', () => {
    const result = pageCompositionsToPayloadPages('tenant-1', compositions);
    expect(result[1]).toMatchObject({ slug: 'about', isHomepage: false });
    expect(result[2]).toMatchObject({ slug: 'product-list', isHomepage: false });
  });

  it('humanize pageKey：product-list → "Product List"', () => {
    const result = pageCompositionsToPayloadPages('tenant-1', compositions);
    expect(result[2]!.title).toBe('Product List');
  });

  it('全部寫入 tenantId + status=published', () => {
    const result = pageCompositionsToPayloadPages('tenant-1', compositions);
    expect(result.every((p) => p.tenantId === 'tenant-1')).toBe(true);
    expect(result.every((p) => p.status === 'published')).toBe(true);
  });

  it('layout 依 block.order 排序後輸出', () => {
    const out = pageCompositionsToPayloadPages('tenant-1', [
      {
        pageKey: 'home',
        blocks: [
          { ...FEATURES, order: 0 },
          { ...HERO, order: 1 },
        ],
      },
    ]);
    expect(out[0]!.layout.map((b) => b.blockType)).toEqual(['features-grid', 'hero']);
  });

  it('空 compositions → []', () => {
    expect(pageCompositionsToPayloadPages('tenant-1', [])).toEqual([]);
  });
});
