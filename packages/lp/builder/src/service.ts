import { randomUUID } from 'node:crypto';

import type { LpBlock, LpPage, LpPageStore } from './types.js';

export interface CreatePageInput {
  tenantId: string;
  slug: string;
  title: string;
  blocks?: LpBlock[];
  now?: Date;
}

/** LP Page builder service：page CRUD + block 拖拉 / 開關 / 複製 + 發布。 */
export class LpBuilderService {
  constructor(private readonly store: LpPageStore) {}

  /** 建立草稿頁。 */
  async createPage(input: CreatePageInput): Promise<LpPage> {
    const existing = await this.store.findBySlug(input.tenantId, input.slug);
    if (existing) throw new Error(`slug 已存在：${input.slug}`);
    const now = input.now ?? new Date();
    const page: LpPage = {
      id: randomUUID(),
      tenantId: input.tenantId,
      slug: input.slug,
      title: input.title,
      blocks: input.blocks ?? [],
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    };
    await this.store.upsert(page);
    return page;
  }

  /** 加入一個區塊（預設加在末尾）。 */
  async addBlock(
    pageId: string,
    block: Omit<LpBlock, 'id'>,
    insertAt?: number,
    now: Date = new Date(),
  ): Promise<LpPage> {
    const page = await this.requirePage(pageId);
    const newBlock: LpBlock = { ...block, id: randomUUID() };
    if (insertAt === undefined || insertAt >= page.blocks.length) {
      page.blocks.push(newBlock);
    } else {
      page.blocks.splice(Math.max(0, insertAt), 0, newBlock);
    }
    page.updatedAt = now;
    await this.store.upsert(page);
    return page;
  }

  /** 重排區塊（拖拉）。 */
  async reorderBlocks(pageId: string, newOrderIds: string[], now: Date = new Date()): Promise<LpPage> {
    const page = await this.requirePage(pageId);
    const map = new Map(page.blocks.map((b) => [b.id, b]));
    if (newOrderIds.length !== page.blocks.length) {
      throw new Error('新順序的 id 數量與現有區塊不符');
    }
    const reordered: LpBlock[] = [];
    for (const id of newOrderIds) {
      const b = map.get(id);
      if (!b) throw new Error(`找不到區塊：${id}`);
      reordered.push(b);
    }
    page.blocks = reordered;
    page.updatedAt = now;
    await this.store.upsert(page);
    return page;
  }

  /** 切換區塊啟用狀態。 */
  async toggleBlock(pageId: string, blockId: string, now: Date = new Date()): Promise<LpPage> {
    const page = await this.requirePage(pageId);
    const block = page.blocks.find((b) => b.id === blockId);
    if (!block) throw new Error(`找不到區塊：${blockId}`);
    block.enabled = !block.enabled;
    page.updatedAt = now;
    await this.store.upsert(page);
    return page;
  }

  /** 複製區塊（複製本插在原區塊後面）。 */
  async duplicateBlock(pageId: string, blockId: string, now: Date = new Date()): Promise<LpPage> {
    const page = await this.requirePage(pageId);
    const idx = page.blocks.findIndex((b) => b.id === blockId);
    if (idx < 0) throw new Error(`找不到區塊：${blockId}`);
    const original = page.blocks[idx];
    if (!original) throw new Error('區塊資料異常');
    const copy: LpBlock = {
      id: randomUUID(),
      type: original.type,
      enabled: original.enabled,
      props: structuredClone(original.props),
    };
    page.blocks.splice(idx + 1, 0, copy);
    page.updatedAt = now;
    await this.store.upsert(page);
    return page;
  }

  /** 移除區塊。 */
  async removeBlock(pageId: string, blockId: string, now: Date = new Date()): Promise<LpPage> {
    const page = await this.requirePage(pageId);
    const len = page.blocks.length;
    page.blocks = page.blocks.filter((b) => b.id !== blockId);
    if (page.blocks.length === len) throw new Error(`找不到區塊：${blockId}`);
    page.updatedAt = now;
    await this.store.upsert(page);
    return page;
  }

  /** 更新區塊 props（後台編輯）。 */
  async updateBlockProps(
    pageId: string,
    blockId: string,
    props: Record<string, unknown>,
    now: Date = new Date(),
  ): Promise<LpPage> {
    const page = await this.requirePage(pageId);
    const block = page.blocks.find((b) => b.id === blockId);
    if (!block) throw new Error(`找不到區塊：${blockId}`);
    block.props = { ...block.props, ...props };
    page.updatedAt = now;
    await this.store.upsert(page);
    return page;
  }

  /** 發布。 */
  async publish(pageId: string, now: Date = new Date()): Promise<LpPage> {
    const page = await this.requirePage(pageId);
    page.status = 'published';
    page.publishedAt = now;
    page.scheduledPublishAt = undefined;
    page.updatedAt = now;
    await this.store.upsert(page);
    return page;
  }

  /** 排程發布。 */
  async schedulePublish(pageId: string, at: Date, now: Date = new Date()): Promise<LpPage> {
    if (at.getTime() <= now.getTime()) throw new Error('排程時間需大於現在');
    const page = await this.requirePage(pageId);
    page.scheduledPublishAt = at;
    page.updatedAt = now;
    await this.store.upsert(page);
    return page;
  }

  /** 取消發布。 */
  async unpublish(pageId: string, now: Date = new Date()): Promise<LpPage> {
    const page = await this.requirePage(pageId);
    page.status = 'draft';
    page.publishedAt = undefined;
    page.updatedAt = now;
    await this.store.upsert(page);
    return page;
  }

  /** 取得已發布的頁面（前台渲染用）。隱藏 disabled block。 */
  async getPublishedPage(tenantId: string, slug: string): Promise<LpPage | undefined> {
    const page = await this.store.findBySlug(tenantId, slug);
    if (!page) return undefined;
    if (page.status !== 'published') return undefined;
    return { ...page, blocks: page.blocks.filter((b) => b.enabled) };
  }

  /** 批次跑排程：把已到期的 scheduledPublishAt 標為 published。 */
  async runScheduledPublish(tenantId: string, now: Date = new Date()): Promise<LpPage[]> {
    const pages = await this.store.list(tenantId);
    const published: LpPage[] = [];
    for (const p of pages) {
      if (p.status === 'published') continue;
      if (!p.scheduledPublishAt) continue;
      if (p.scheduledPublishAt.getTime() > now.getTime()) continue;
      p.status = 'published';
      p.publishedAt = now;
      p.scheduledPublishAt = undefined;
      p.updatedAt = now;
      await this.store.upsert(p);
      published.push(p);
    }
    return published;
  }

  private async requirePage(pageId: string): Promise<LpPage> {
    const page = await this.store.get(pageId);
    if (!page) throw new Error(`找不到 LP 頁面：${pageId}`);
    return page;
  }
}
