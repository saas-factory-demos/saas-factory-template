import type { LpPage, LpPageStore } from './types.js';

/** 記憶體版 LpPageStore。 */
export class InMemoryLpPageStore implements LpPageStore {
  private readonly pages = new Map<string, LpPage>();

  async get(id: string): Promise<LpPage | undefined> {
    return this.pages.get(id);
  }

  async findBySlug(tenantId: string, slug: string): Promise<LpPage | undefined> {
    for (const p of this.pages.values()) {
      if (p.tenantId === tenantId && p.slug === slug) return p;
    }
    return undefined;
  }

  async upsert(p: LpPage): Promise<void> {
    this.pages.set(p.id, p);
  }

  async list(tenantId: string): Promise<LpPage[]> {
    return Array.from(this.pages.values()).filter((p) => p.tenantId === tenantId);
  }
}
