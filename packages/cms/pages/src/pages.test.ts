import { beforeEach, describe, expect, it } from 'vitest';

import { InMemoryPageStore } from './in-memory-store.js';
import { computeFullPath, findPageByPath, normalizeSlug } from './path.js';
import { PageService } from './service.js';

import type { BlockInstance } from '@saas-factory/factory-types';

const TENANT = 'tenant-1';

/**
 * 一份合法的 layout（hero block 用 BLOCK_REGISTRY heroSchema 跑得過驗證）。
 * heroSchema 必要欄位：headline（min:1, max:160）。
 */
function makeLayout(): BlockInstance[] {
  return [
    {
      id: 'b1',
      type: 'hero',
      variant: 'centered',
      config: {
        variant: 'centered',
        headline: '歡迎光臨',
        ctas: [],
        motion: { variant: 'slideUp', delay: 0 },
      },
      visible: true,
      order: 0,
    },
  ];
}

describe('normalizeSlug', () => {
  it('英文小寫 + 減號', () => {
    expect(normalizeSlug('About Us')).toBe('about-us');
    expect(normalizeSlug('  Hello_World  ')).toBe('hello-world');
  });
  it('保留中文', () => {
    expect(normalizeSlug('關於我們')).toBe('關於我們');
  });
  it('移除非法字元', () => {
    expect(normalizeSlug('hello@world!')).toBe('helloworld');
  });
});

describe('PageService', () => {
  let store: InMemoryPageStore;
  let service: PageService;

  beforeEach(() => {
    store = new InMemoryPageStore();
    service = new PageService(store);
  });

  it('建立 draft 頁面 + slug 正規化', async () => {
    const page = await service.create({
      tenantId: TENANT,
      title: '關於我們',
      slug: 'About Us',
      layout: makeLayout(),
    });
    expect(page.slug).toBe('about-us');
    expect(page.status).toBe('draft');
    expect(page.publishedAt).toBeUndefined();
  });

  it('同層 slug 重複 throw', async () => {
    await service.create({ tenantId: TENANT, title: 'A', slug: 'about', layout: makeLayout() });
    await expect(
      service.create({ tenantId: TENANT, title: 'B', slug: 'about', layout: makeLayout() }),
    ).rejects.toThrow(/已存在 slug/);
  });

  it('layout 驗證失敗 throw（hero headline 缺）', async () => {
    await expect(
      service.create({
        tenantId: TENANT,
        title: 'X',
        slug: 'x',
        layout: [
          {
            id: 'b1',
            type: 'hero',
            variant: 'centered',
            config: { variant: 'centered' },
            visible: true,
            order: 0,
          },
        ],
      }),
    ).rejects.toThrow(/驗證失敗/);
  });

  it('未知 Tier 1 block type 不報錯（industry dotted slug fallback）', async () => {
    const page = await service.create({
      tenantId: TENANT,
      title: 'Y',
      slug: 'y',
      layout: [
        {
          id: 'b1',
          type: 'profile.chef',
          variant: 'default',
          config: { name: 'Test' },
          visible: true,
          order: 0,
        },
      ],
    });
    expect(page.id).toBeDefined();
  });

  it('publish 切換狀態 + 紀錄 publishedAt', async () => {
    const p = await service.create({
      tenantId: TENANT,
      title: 'A',
      slug: 'a',
      layout: makeLayout(),
    });
    const published = await service.publish(p.id);
    expect(published.status).toBe('published');
    expect(published.publishedAt).toBeInstanceOf(Date);
  });

  it('排程發布 → publishScheduled 切換', async () => {
    const p = await service.create({
      tenantId: TENANT,
      title: 'B',
      slug: 'b',
      layout: makeLayout(),
    });
    const future = new Date(Date.now() + 60_000);
    await service.schedule(p.id, future);
    const before = await service.publishScheduled(TENANT, new Date());
    expect(before).toHaveLength(0);
    const after = await service.publishScheduled(TENANT, new Date(future.getTime() + 1_000));
    expect(after).toHaveLength(1);
    expect(after[0]?.status).toBe('published');
  });

  it('isHomepage 唯一', async () => {
    await service.create({
      tenantId: TENANT,
      title: '首頁',
      slug: 'home',
      layout: makeLayout(),
      isHomepage: true,
    });
    await expect(
      service.create({
        tenantId: TENANT,
        title: '另一首頁',
        slug: 'home2',
        layout: makeLayout(),
        isHomepage: true,
      }),
    ).rejects.toThrow(/已存在首頁/);
  });

  it('getByPath 找 homepage', async () => {
    await service.create({
      tenantId: TENANT,
      title: '首頁',
      slug: 'home',
      layout: makeLayout(),
      isHomepage: true,
    });
    const r = await service.getByPath(TENANT, '/');
    expect(r?.isHomepage).toBe(true);
  });

  it('巢狀路徑解析 + computeFullPath', async () => {
    const parent = await service.create({
      tenantId: TENANT,
      title: '服務',
      slug: 'services',
      layout: makeLayout(),
    });
    const child = await service.create({
      tenantId: TENANT,
      title: '網站設計',
      slug: 'web-design',
      parentId: parent.id,
      layout: makeLayout(),
    });
    const found = await service.getByPath(TENANT, '/services/web-design');
    expect(found?.id).toBe(child.id);
    const path = await service.getFullPath(child);
    expect(path).toBe('/services/web-design');
  });

  it('getTree 排序', async () => {
    const a = await service.create({
      tenantId: TENANT,
      title: 'A',
      slug: 'a',
      layout: makeLayout(),
      sortOrder: 2,
    });
    const b = await service.create({
      tenantId: TENANT,
      title: 'B',
      slug: 'b',
      layout: makeLayout(),
      sortOrder: 1,
    });
    const tree = await service.getTree(TENANT);
    expect(tree.map((n) => n.id)).toEqual([b.id, a.id]);
  });
});

describe('findPageByPath', () => {
  it('找不到回 undefined', () => {
    expect(findPageByPath('/nope', [])).toBeUndefined();
  });
});

describe('computeFullPath edge', () => {
  it('homepage 回 /', () => {
    const homepage = {
      id: 'h',
      tenantId: 't',
      title: '首',
      slug: 'home',
      layout: [],
      status: 'published' as const,
      isHomepage: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    expect(computeFullPath(homepage, [homepage])).toBe('/');
  });
});
