import { extractPlainText } from './plain-text.js';

import type {
  CreateFaqInput,
  FaqCategory,
  FaqFilter,
  FaqItem,
  FaqStore,
} from './types.js';

/**
 * FAQ 服務（分類管理 + 排序 + 搜尋 + 點擊統計）。
 */
export class FaqService {
  private readonly store: FaqStore;

  constructor(store: FaqStore) {
    this.store = store;
  }

  private genId(prefix: string): string {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  /** 建立分類。 */
  async createCategory(input: {
    tenantId: string;
    name: string;
    slug: string;
    description?: string;
    sortOrder?: number;
  }): Promise<FaqCategory> {
    const now = new Date();
    return this.store.upsertCategory({
      id: this.genId('faq-cat'),
      tenantId: input.tenantId,
      name: input.name,
      slug: input.slug,
      description: input.description,
      sortOrder: input.sortOrder ?? 0,
      createdAt: now,
      updatedAt: now,
    });
  }

  /** 列出分類（已依 sortOrder 排序）。 */
  async listCategories(tenantId: string): Promise<FaqCategory[]> {
    return this.store.listCategories(tenantId);
  }

  /** 建立 FAQ。 */
  async createItem(input: CreateFaqInput): Promise<FaqItem> {
    const now = new Date();
    const answerPlain = input.answerPlain ?? extractPlainText(input.answer);
    return this.store.createItem({
      id: this.genId('faq'),
      tenantId: input.tenantId,
      categoryId: input.categoryId,
      question: input.question,
      answer: input.answer,
      answerPlain,
      sortOrder: input.sortOrder ?? 0,
      clickCount: 0,
      published: input.published ?? true,
      createdAt: now,
      updatedAt: now,
    });
  }

  /** 更新 FAQ。 */
  async updateItem(id: string, patch: Partial<CreateFaqInput>): Promise<FaqItem> {
    const merged: Partial<FaqItem> = { ...patch };
    if (patch.answer !== undefined) {
      merged.answerPlain = patch.answerPlain ?? extractPlainText(patch.answer);
    }
    return this.store.updateItem(id, merged);
  }

  /** 列出 FAQ（可指定分類 / 搜尋 / 是否已發布）。 */
  async listItems(tenantId: string, filter?: FaqFilter): Promise<FaqItem[]> {
    return this.store.listItems(tenantId, filter);
  }

  /**
   * 前台搜尋（僅已發布、依命中度排序：question 命中優先，再依 sortOrder）。
   */
  async search(tenantId: string, query: string): Promise<FaqItem[]> {
    const trimmed = query.trim();
    if (!trimmed) return [];
    const list = await this.store.listItems(tenantId, { published: true, search: trimmed });
    const q = trimmed.toLowerCase();
    return list.sort((a, b) => {
      const aHit = a.question.toLowerCase().includes(q) ? 0 : 1;
      const bHit = b.question.toLowerCase().includes(q) ? 0 : 1;
      if (aHit !== bHit) return aHit - bHit;
      return a.sortOrder - b.sortOrder;
    });
  }

  /**
   * 點擊統計：折疊展開時呼叫一次。
   */
  async incrementClick(id: string): Promise<FaqItem> {
    const cur = await this.store.findItemById(id);
    if (!cur) throw new Error(`FAQ 不存在：${id}`);
    return this.store.updateItem(id, { clickCount: cur.clickCount + 1 });
  }

  /**
   * 取得指定 tenant 點擊次數最高的 N 個 FAQ（後台統計 / 前台熱門）。
   */
  async topClicked(tenantId: string, limit = 10): Promise<FaqItem[]> {
    const all = await this.store.listItems(tenantId, { published: true });
    return [...all].sort((a, b) => b.clickCount - a.clickCount).slice(0, limit);
  }

  /**
   * 取得「分類 + 該分類下的 FAQ」結構，給前台折疊式呈現用。
   */
  async listGrouped(tenantId: string): Promise<
    Array<{ category: FaqCategory | null; items: FaqItem[] }>
  > {
    const [cats, items] = await Promise.all([
      this.store.listCategories(tenantId),
      this.store.listItems(tenantId, { published: true }),
    ]);
    const byCat = new Map<string, FaqItem[]>();
    const uncategorized: FaqItem[] = [];
    for (const it of items) {
      if (it.categoryId) {
        const arr = byCat.get(it.categoryId) ?? [];
        arr.push(it);
        byCat.set(it.categoryId, arr);
      } else {
        uncategorized.push(it);
      }
    }
    const groups: Array<{ category: FaqCategory | null; items: FaqItem[] }> = [];
    for (const cat of cats) {
      const arr = byCat.get(cat.id);
      if (arr && arr.length > 0) groups.push({ category: cat, items: arr });
    }
    if (uncategorized.length > 0) groups.push({ category: null, items: uncategorized });
    return groups;
  }
}
