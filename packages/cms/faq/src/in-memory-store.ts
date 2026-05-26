import type { FaqCategory, FaqFilter, FaqItem, FaqStore } from './types.js';

/**
 * 記憶體版 FAQ 儲存。
 */
export class InMemoryFaqStore implements FaqStore {
  private readonly categories = new Map<string, FaqCategory>();
  private readonly items = new Map<string, FaqItem>();

  async upsertCategory(c: FaqCategory): Promise<FaqCategory> {
    this.categories.set(c.id, c);
    return c;
  }

  async listCategories(tenantId: string): Promise<FaqCategory[]> {
    return [...this.categories.values()]
      .filter((c) => c.tenantId === tenantId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async findCategoryById(id: string): Promise<FaqCategory | undefined> {
    return this.categories.get(id);
  }

  async createItem(item: FaqItem): Promise<FaqItem> {
    this.items.set(item.id, item);
    return item;
  }

  async updateItem(id: string, patch: Partial<FaqItem>): Promise<FaqItem> {
    const cur = this.items.get(id);
    if (!cur) throw new Error(`FaqItem 不存在：${id}`);
    const next: FaqItem = { ...cur, ...patch, updatedAt: new Date() };
    this.items.set(id, next);
    return next;
  }

  async findItemById(id: string): Promise<FaqItem | undefined> {
    return this.items.get(id);
  }

  async listItems(tenantId: string, filter: FaqFilter = {}): Promise<FaqItem[]> {
    const search = filter.search?.trim().toLowerCase();
    const out: FaqItem[] = [];
    for (const it of this.items.values()) {
      if (it.tenantId !== tenantId) continue;
      if (filter.categoryId && it.categoryId !== filter.categoryId) continue;
      if (filter.published !== undefined && it.published !== filter.published) continue;
      if (search) {
        const hay = `${it.question}\n${it.answerPlain}`.toLowerCase();
        if (!hay.includes(search)) continue;
      }
      out.push(it);
    }
    return out.sort((a, b) => a.sortOrder - b.sortOrder);
  }
}
