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

  it('還原 {value} 包裝陣列 → plain primitive 陣列（seed wrap 的鏡像）', () => {
    const layout: PayloadBlockDoc[] = [
      {
        blockType: 'pricing-table',
        // Payload 存的 primitive 陣列形狀：[{id,value}]
        perks: [
          { id: 'a', value: '無限專案' },
          { id: 'b', value: '社群支援' },
        ],
      },
    ];
    const config = mapPayloadLayoutToBlocks(layout)[0]?.config;
    expect(config?.perks).toEqual(['無限專案', '社群支援']);
  });

  it('還原巢狀 {value} 包裝（tiers[].features）', () => {
    const layout: PayloadBlockDoc[] = [
      {
        blockType: 'pricing-table',
        tiers: [
          { name: 'Starter', features: [{ id: '1', value: '1 個專案' }, { id: '2', value: '社群支援' }] },
          { name: 'Team', features: [{ value: '無限專案' }] },
        ],
      },
    ];
    const config = mapPayloadLayoutToBlocks(layout)[0]?.config;
    expect(config?.tiers).toEqual([
      { name: 'Starter', features: ['1 個專案', '社群支援'] },
      { name: 'Team', features: ['無限專案'] },
    ]);
  });

  it('populated media doc {id,url,alt,...} 還原為 {src, alt}（補 9 block 都讀 .src）', () => {
    const layout: PayloadBlockDoc[] = [
      {
        blockType: 'gallery',
        items: [
          {
            image: {
              id: 7,
              url: '/api/media/file/gen-x.png',
              alt: '炙燒鴨胸佐橙皮醬',
              filename: 'gen-x.png',
              mimeType: 'image/png',
              width: 1536,
              height: 1024,
            },
            caption: 'A',
          },
        ],
      },
    ];
    const config = mapPayloadLayoutToBlocks(layout)[0]?.config as {
      items: Array<{ image: { src: string; alt: string }; caption: string }>;
    };
    expect(config.items[0]?.image).toEqual({ src: '/api/media/file/gen-x.png', alt: '炙燒鴨胸佐橙皮醬' });
    expect(config.items[0]?.caption).toBe('A');
  });

  it('媒體物件無 alt → 還原時 alt 給空字串', () => {
    const layout: PayloadBlockDoc[] = [
      { blockType: 'hero', backgroundImage: { id: 9, url: '/api/media/file/a.png' } },
    ];
    const config = mapPayloadLayoutToBlocks(layout)[0]?.config as {
      backgroundImage: { src: string; alt: string };
    };
    expect(config.backgroundImage).toEqual({ src: '/api/media/file/a.png', alt: '' });
  });

  it('一般帶 url 物件（無 id）不被誤判為媒體（如 link）', () => {
    const layout: PayloadBlockDoc[] = [
      {
        blockType: 'cta',
        primary: { label: '了解更多', url: '/about' },
      },
    ];
    const config = mapPayloadLayoutToBlocks(layout)[0]?.config as {
      primary: { label: string; url: string };
    };
    // 沒 id → 不算媒體，保留原物件
    expect(config.primary).toEqual({ label: '了解更多', url: '/about' });
  });

  it('真的物件陣列（多 key）不被誤判還原', () => {
    const layout: PayloadBlockDoc[] = [
      {
        blockType: 'features',
        items: [
          { id: 'x', value: 'a', label: 'A' },
          { title: 'B' },
        ],
      },
    ];
    const config = mapPayloadLayoutToBlocks(layout)[0]?.config;
    // 元素含 value 以外的 key（label / title）→ 不算包裝陣列，原樣保留
    expect(config?.items).toEqual([
      { id: 'x', value: 'a', label: 'A' },
      { title: 'B' },
    ]);
  });
});
