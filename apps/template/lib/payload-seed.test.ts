import { describe, expect, it, vi } from 'vitest';

import {
  blockInstanceToPayloadBlock,
  createPlaceholderMediaCache,
  pageCompositionsToPayloadPages,
  transformPayloadBlockForPayload,
  transformValueForPayload,
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

describe('transformValueForPayload — primitive array wrap', () => {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const dummyPayload = { create: vi.fn() } as any;

  it('string 陣列 → [{value:str}, ...]（對應 zod-payload 對 z.array(z.string()) 的 wrap）', async () => {
    const cache = createPlaceholderMediaCache();
    const out = await transformValueForPayload(dummyPayload, 't1', ['a', 'b', 'c'], cache);
    expect(out).toEqual([{ value: 'a' }, { value: 'b' }, { value: 'c' }]);
  });

  it('number 陣列 → [{value:num}, ...]', async () => {
    const cache = createPlaceholderMediaCache();
    const out = await transformValueForPayload(dummyPayload, 't1', [1, 2, 3], cache);
    expect(out).toEqual([{ value: 1 }, { value: 2 }, { value: 3 }]);
  });

  it('物件陣列不 wrap（遞迴每個元素）', async () => {
    const cache = createPlaceholderMediaCache();
    const out = await transformValueForPayload(
      dummyPayload,
      't1',
      [{ title: 'A' }, { title: 'B' }],
      cache,
    );
    expect(out).toEqual([{ title: 'A' }, { title: 'B' }]);
  });

  it('空陣列原樣回（無 primitive 可偵測）', async () => {
    const cache = createPlaceholderMediaCache();
    const out = await transformValueForPayload(dummyPayload, 't1', [], cache);
    expect(out).toEqual([]);
  });

  it('巢狀：tier.features 字串陣列也會 wrap', async () => {
    const cache = createPlaceholderMediaCache();
    const out = await transformValueForPayload(
      dummyPayload,
      't1',
      [
        { name: 'Starter', features: ['1 個專案', '社群支援'] },
        { name: 'Team', features: ['無限專案'] },
      ],
      cache,
    );
    expect(out).toEqual([
      { name: 'Starter', features: [{ value: '1 個專案' }, { value: '社群支援' }] },
      { name: 'Team', features: [{ value: '無限專案' }] },
    ]);
  });

  it('null / undefined / primitive 純值原樣回', async () => {
    const cache = createPlaceholderMediaCache();
    expect(await transformValueForPayload(dummyPayload, 't1', null, cache)).toBe(null);
    expect(await transformValueForPayload(dummyPayload, 't1', undefined, cache)).toBe(undefined);
    expect(await transformValueForPayload(dummyPayload, 't1', 'hello', cache)).toBe('hello');
    expect(await transformValueForPayload(dummyPayload, 't1', 42, cache)).toBe(42);
  });
});

describe('transformValueForPayload — image asset 上傳', () => {
  it('image asset {src,alt} → 呼叫 payload.create + 換成 media id；tenant 內共用同筆', async () => {
    const create = vi.fn().mockResolvedValue({ id: 42 });
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const payload = { create } as any;
    const cache = createPlaceholderMediaCache();

    const out = await transformValueForPayload(
      payload,
      't1',
      { image: { src: '/p/1.jpg', alt: '圖一' }, caption: 'A' },
      cache,
    );
    expect(out).toEqual({ image: 42, caption: 'A' });

    // 第二張同樣呼叫 → 不再上傳，直接 reuse cache.id
    const out2 = await transformValueForPayload(
      payload,
      't1',
      { image: { src: '/p/2.jpg', alt: '圖二' } },
      cache,
    );
    expect(out2).toEqual({ image: 42 });
    expect(create).toHaveBeenCalledTimes(1);

    // 確認上傳呼叫帶 file + alt
    const call = create.mock.calls[0]![0];
    expect(call.collection).toBe('media');
    expect(call.data.alt).toBe('圖一');
    expect(call.file.mimetype).toBe('image/png');
    expect(call.file.name).toBe('placeholder-t1.png');
    expect(call.file.data).toBeInstanceOf(Buffer);
  });

  it('並發轉換多張 image asset → 只 create 一次（避免撞 filename unique）', async () => {
    /* 模擬慢速 create：給後續並發呼叫者「在第一筆完成前」搶進的時間窗，
     * 驗證 in-flight promise 快取會把它們收斂到同一筆 media。 */
    let resolveCreate: ((v: { id: number }) => void) | undefined;
    const create = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveCreate = resolve;
        }),
    );
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const payload = { create } as any;
    const cache = createPlaceholderMediaCache();

    // 同時啟動 3 筆轉換（不 await），模擬 Promise.all 並發
    const p1 = transformValueForPayload(payload, 't1', { src: '/p/1.jpg', alt: 'A' }, cache);
    const p2 = transformValueForPayload(payload, 't1', { src: '/p/2.jpg', alt: 'B' }, cache);
    const p3 = transformValueForPayload(payload, 't1', { src: '/p/3.jpg', alt: 'C' }, cache);

    // 此時三者都已「同步」走過 ensurePlaceholderMediaId，但 create 尚未 resolve
    expect(create).toHaveBeenCalledTimes(1);

    resolveCreate!({ id: 99 });
    const [r1, r2, r3] = await Promise.all([p1, p2, p3]);
    expect([r1, r2, r3]).toEqual([99, 99, 99]);
    expect(create).toHaveBeenCalledTimes(1);
  });

  it('create 失敗 → cache 歸零，後續 asset 可重試', async () => {
    const create = vi
      .fn()
      .mockRejectedValueOnce(new Error('first boom'))
      .mockResolvedValueOnce({ id: 7 });
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const payload = { create } as any;
    const cache = createPlaceholderMediaCache();

    await expect(
      transformValueForPayload(payload, 't1', { src: '/p/1.jpg', alt: 'A' }, cache),
    ).rejects.toThrow('first boom');

    // 第二次（新 asset）應重試成功，不卡在毒化的 cache
    const out = await transformValueForPayload(payload, 't1', { src: '/p/2.jpg', alt: 'B' }, cache);
    expect(out).toBe(7);
    expect(create).toHaveBeenCalledTimes(2);
  });

  it('image asset 已帶 mediaId（generate-images 預填真實圖）→ 直接用該 id，不上傳 placeholder', async () => {
    const create = vi.fn();
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const payload = { create } as any;
    const cache = createPlaceholderMediaCache();
    const out = await transformValueForPayload(
      payload,
      't1',
      { image: { src: '/p/1.jpg', alt: '主視覺', mediaId: 314 }, caption: 'A' },
      cache,
    );
    expect(out).toEqual({ image: 314, caption: 'A' });
    expect(create).not.toHaveBeenCalled();
  });

  it('不是 image asset shape（缺 src 或 alt）→ 不上傳，遞迴正常處理', async () => {
    const create = vi.fn();
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const payload = { create } as any;
    const cache = createPlaceholderMediaCache();
    const out = await transformValueForPayload(
      payload,
      't1',
      { src: 'only-src.jpg', caption: 'X' },
      cache,
    );
    expect(out).toEqual({ src: 'only-src.jpg', caption: 'X' });
    expect(create).not.toHaveBeenCalled();
  });
});

describe('transformPayloadBlockForPayload', () => {
  it('intrinsic key（id/blockType/variant/visible）原樣保留；其餘 key 跑 transform', async () => {
    const create = vi.fn().mockResolvedValue({ id: 7 });
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const payload = { create } as any;
    const cache = createPlaceholderMediaCache();

    const out = await transformPayloadBlockForPayload(
      payload,
      'tenant-x',
      {
        id: 'b1',
        blockType: 'gallery',
        variant: 'grid-3',
        visible: true,
        headline: '案例',
        items: [
          { image: { src: '/p/a.jpg', alt: 'A' }, caption: 'A' },
          { image: { src: '/p/b.jpg', alt: 'B' }, caption: 'B' },
        ],
      },
      cache,
    );
    expect(out).toMatchObject({
      id: 'b1',
      blockType: 'gallery',
      variant: 'grid-3',
      visible: true,
      headline: '案例',
      items: [
        { image: 7, caption: 'A' },
        { image: 7, caption: 'B' },
      ],
    });
  });
});
