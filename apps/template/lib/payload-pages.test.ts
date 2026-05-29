import { describe, expect, it } from 'vitest';

import { mapPayloadLayoutToBlocks, type PayloadBlockDoc } from './payload-pages.js';

describe('mapPayloadLayoutToBlocks', () => {
  it('null / undefined / 空陣列 → []', () => {
    expect(mapPayloadLayoutToBlocks(null)).toEqual([]);
    expect(mapPayloadLayoutToBlocks(undefined)).toEqual([]);
    expect(mapPayloadLayoutToBlocks([])).toEqual([]);
  });

  it('單 block：blockType → type，剩餘 fields → config', () => {
    const layout: PayloadBlockDoc[] = [
      {
        id: 'b1',
        blockType: 'hero',
        variant: 'centered',
        visible: true,
        headline: '歡迎光臨',
        ctas: [],
      },
    ];
    const result = mapPayloadLayoutToBlocks(layout);
    expect(result).toEqual([
      {
        id: 'b1',
        type: 'hero',
        variant: 'centered',
        config: { headline: '歡迎光臨', ctas: [] },
        visible: true,
        order: 0,
      },
    ]);
  });

  it('多 block：order 依 index 遞增', () => {
    const layout: PayloadBlockDoc[] = [
      { id: 'b1', blockType: 'hero', variant: 'centered', headline: 'H' },
      { id: 'b2', blockType: 'features', variant: 'grid', items: [] },
      { id: 'b3', blockType: 'cta', variant: 'split', text: 'X' },
    ];
    const result = mapPayloadLayoutToBlocks(layout);
    expect(result.map((b) => b.order)).toEqual([0, 1, 2]);
    expect(result.map((b) => b.type)).toEqual(['hero', 'features', 'cta']);
  });

  it('未指定 variant → "default"', () => {
    const layout: PayloadBlockDoc[] = [{ blockType: 'hero', headline: 'H' }];
    expect(mapPayloadLayoutToBlocks(layout)[0]?.variant).toBe('default');
  });

  it('未指定 visible → true', () => {
    const layout: PayloadBlockDoc[] = [{ blockType: 'hero' }];
    expect(mapPayloadLayoutToBlocks(layout)[0]?.visible).toBe(true);
  });

  it('visible = false 保留', () => {
    const layout: PayloadBlockDoc[] = [{ blockType: 'hero', visible: false }];
    expect(mapPayloadLayoutToBlocks(layout)[0]?.visible).toBe(false);
  });

  it('未指定 id → fallback 為 block-{index}', () => {
    const layout: PayloadBlockDoc[] = [{ blockType: 'hero' }, { blockType: 'features' }];
    const result = mapPayloadLayoutToBlocks(layout);
    expect(result[0]?.id).toBe('block-0');
    expect(result[1]?.id).toBe('block-1');
  });

  it('剔除 intrinsic keys（id / blockType / blockName / variant / visible）不入 config', () => {
    const layout: PayloadBlockDoc[] = [
      {
        id: 'b1',
        blockType: 'hero',
        blockName: 'My Hero',
        variant: 'centered',
        visible: true,
        headline: 'H',
      },
    ];
    const config = mapPayloadLayoutToBlocks(layout)[0]?.config;
    expect(config).toEqual({ headline: 'H' });
    expect(config).not.toHaveProperty('id');
    expect(config).not.toHaveProperty('blockType');
    expect(config).not.toHaveProperty('blockName');
    expect(config).not.toHaveProperty('variant');
    expect(config).not.toHaveProperty('visible');
  });

  it('巢狀物件保留在 config', () => {
    const layout: PayloadBlockDoc[] = [
      {
        blockType: 'hero',
        motion: { variant: 'slideUp', delay: 0 },
        ctas: [{ label: '了解更多', href: '/about' }],
      },
    ];
    const config = mapPayloadLayoutToBlocks(layout)[0]?.config;
    expect(config?.motion).toEqual({ variant: 'slideUp', delay: 0 });
    expect(config?.ctas).toEqual([{ label: '了解更多', href: '/about' }]);
  });
});
