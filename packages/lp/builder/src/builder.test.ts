import { describe, expect, it } from 'vitest';

import { InMemoryLpPageStore } from './in-memory-store.js';
import { LpBuilderService } from './service.js';

const TENANT = 't1';

async function setup() {
  const store = new InMemoryLpPageStore();
  const svc = new LpBuilderService(store);
  const page = await svc.createPage({
    tenantId: TENANT,
    slug: 'summer-sale',
    title: '夏季特賣',
  });
  return { store, svc, page };
}

describe('LpBuilderService.createPage', () => {
  it('建立草稿', async () => {
    const { page } = await setup();
    expect(page.status).toBe('draft');
    expect(page.blocks).toHaveLength(0);
  });

  it('slug 重複 → throw', async () => {
    const { svc } = await setup();
    await expect(
      svc.createPage({ tenantId: TENANT, slug: 'summer-sale', title: '重複' }),
    ).rejects.toThrow(/已存在/);
  });
});

describe('LpBuilderService block 操作', () => {
  it('addBlock 預設追加在末尾', async () => {
    const { svc, page } = await setup();
    const p1 = await svc.addBlock(page.id, { type: 'hero', enabled: true, props: { title: 'Hi' } });
    const p2 = await svc.addBlock(p1.id, { type: 'faq', enabled: true, props: {} });
    expect(p2.blocks.map((b) => b.type)).toEqual(['hero', 'faq']);
  });

  it('addBlock 指定 insertAt 插中間', async () => {
    const { svc, page } = await setup();
    await svc.addBlock(page.id, { type: 'a', enabled: true, props: {} });
    await svc.addBlock(page.id, { type: 'c', enabled: true, props: {} });
    const p = await svc.addBlock(page.id, { type: 'b', enabled: true, props: {} }, 1);
    expect(p.blocks.map((b) => b.type)).toEqual(['a', 'b', 'c']);
  });

  it('reorderBlocks 重排', async () => {
    const { svc, page } = await setup();
    let p = await svc.addBlock(page.id, { type: 'a', enabled: true, props: {} });
    p = await svc.addBlock(p.id, { type: 'b', enabled: true, props: {} });
    p = await svc.addBlock(p.id, { type: 'c', enabled: true, props: {} });
    const ids = p.blocks.map((b) => b.id);
    const reordered = await svc.reorderBlocks(p.id, [ids[2]!, ids[0]!, ids[1]!]);
    expect(reordered.blocks.map((b) => b.type)).toEqual(['c', 'a', 'b']);
  });

  it('reorderBlocks 數量不符 → throw', async () => {
    const { svc, page } = await setup();
    const p = await svc.addBlock(page.id, { type: 'a', enabled: true, props: {} });
    await expect(svc.reorderBlocks(p.id, [])).rejects.toThrow(/數量/);
  });

  it('toggleBlock 開關', async () => {
    const { svc, page } = await setup();
    const p = await svc.addBlock(page.id, { type: 'hero', enabled: true, props: {} });
    const bId = p.blocks[0]!.id;
    const toggled = await svc.toggleBlock(p.id, bId);
    expect(toggled.blocks[0]?.enabled).toBe(false);
  });

  it('duplicateBlock 插在原區塊後面', async () => {
    const { svc, page } = await setup();
    let p = await svc.addBlock(page.id, { type: 'hero', enabled: true, props: { title: 'A' } });
    p = await svc.addBlock(p.id, { type: 'faq', enabled: true, props: {} });
    const heroId = p.blocks[0]!.id;
    const dup = await svc.duplicateBlock(p.id, heroId);
    expect(dup.blocks.map((b) => b.type)).toEqual(['hero', 'hero', 'faq']);
    expect(dup.blocks[1]?.id).not.toBe(heroId);
    expect(dup.blocks[1]?.props).toEqual({ title: 'A' });
  });

  it('removeBlock', async () => {
    const { svc, page } = await setup();
    const p = await svc.addBlock(page.id, { type: 'hero', enabled: true, props: {} });
    const result = await svc.removeBlock(p.id, p.blocks[0]!.id);
    expect(result.blocks).toHaveLength(0);
  });

  it('updateBlockProps merge', async () => {
    const { svc, page } = await setup();
    const p = await svc.addBlock(page.id, { type: 'hero', enabled: true, props: { title: 'A', sub: 'X' } });
    const updated = await svc.updateBlockProps(p.id, p.blocks[0]!.id, { title: 'B' });
    expect(updated.blocks[0]?.props).toEqual({ title: 'B', sub: 'X' });
  });
});

describe('LpBuilderService 發布流程', () => {
  it('publish → status published 並可 getPublishedPage', async () => {
    const { svc, page } = await setup();
    await svc.addBlock(page.id, { type: 'hero', enabled: true, props: {} });
    await svc.publish(page.id);
    const live = await svc.getPublishedPage(TENANT, 'summer-sale');
    expect(live?.status).toBe('published');
  });

  it('草稿 getPublishedPage 回 undefined', async () => {
    const { svc } = await setup();
    const live = await svc.getPublishedPage(TENANT, 'summer-sale');
    expect(live).toBeUndefined();
  });

  it('getPublishedPage 過濾 disabled block', async () => {
    const { svc, page } = await setup();
    const p1 = await svc.addBlock(page.id, { type: 'hero', enabled: true, props: {} });
    await svc.addBlock(p1.id, { type: 'faq', enabled: false, props: {} });
    await svc.publish(page.id);
    const live = await svc.getPublishedPage(TENANT, 'summer-sale');
    expect(live?.blocks.map((b) => b.type)).toEqual(['hero']);
  });

  it('schedulePublish 過去時間 → throw', async () => {
    const { svc, page } = await setup();
    await expect(
      svc.schedulePublish(page.id, new Date('2020-01-01'), new Date('2026-05-15')),
    ).rejects.toThrow(/大於現在/);
  });

  it('runScheduledPublish 自動發布到期頁面', async () => {
    const { svc, page } = await setup();
    await svc.schedulePublish(page.id, new Date('2026-05-15T12:00:00Z'), new Date('2026-05-15T10:00:00Z'));
    const before = await svc.runScheduledPublish(TENANT, new Date('2026-05-15T11:00:00Z'));
    expect(before).toHaveLength(0);
    const after = await svc.runScheduledPublish(TENANT, new Date('2026-05-15T13:00:00Z'));
    expect(after).toHaveLength(1);
    expect(after[0]?.status).toBe('published');
  });
});
