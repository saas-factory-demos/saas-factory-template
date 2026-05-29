import type { Page, PageStore } from './types.js';

/**
 * 記憶體 PageStore（測試 / 開發用）。
 */
export class InMemoryPageStore implements PageStore {
  private pages = new Map<string, Page>();

  async create(page: Page): Promise<Page> {
    this.pages.set(page.id, page);
    return page;
  }

  async update(id: string, patch: Partial<Page>): Promise<Page> {
    const current = this.pages.get(id);
    if (!current) throw new Error(`Page 不存在：${id}`);
    const updated: Page = { ...current, ...patch, updatedAt: new Date() };
    this.pages.set(id, updated);
    return updated;
  }

  async findById(id: string): Promise<Page | undefined> {
    return this.pages.get(id);
  }

  async findBySlug(
    tenantId: string,
    parentId: string | undefined,
    slug: string,
  ): Promise<Page | undefined> {
    for (const p of this.pages.values()) {
      if (p.tenantId !== tenantId) continue;
      if ((p.parentId ?? undefined) !== (parentId ?? undefined)) continue;
      if (p.slug === slug) return p;
    }
    return undefined;
  }

  async listByTenant(tenantId: string): Promise<Page[]> {
    return [...this.pages.values()].filter((p) => p.tenantId === tenantId);
  }

  async delete(id: string): Promise<void> {
    this.pages.delete(id);
  }
}
