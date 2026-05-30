import type { LpVersion, PreviewLink } from './types.js';

/** 版本儲存介面。 */
export interface LpVersionStore {
  insert(version: LpVersion): Promise<void>;
  findById(id: string): Promise<LpVersion | undefined>;
  update(version: LpVersion): Promise<void>;
  listByPage(tenantId: string, pageId: string): Promise<LpVersion[]>;
  /** 取得該 page 目前 production 版本（最多 1 個）。 */
  findProduction(tenantId: string, pageId: string): Promise<LpVersion | undefined>;
}

/** 預覽連結儲存介面。 */
export interface PreviewLinkStore {
  insert(link: PreviewLink): Promise<void>;
  findByToken(token: string): Promise<PreviewLink | undefined>;
}

/** In-memory 版本實作。 */
export class InMemoryLpVersionStore implements LpVersionStore {
  private map = new Map<string, LpVersion>();

  async insert(version: LpVersion): Promise<void> {
    this.map.set(version.id, version);
  }

  async findById(id: string): Promise<LpVersion | undefined> {
    return this.map.get(id);
  }

  async update(version: LpVersion): Promise<void> {
    if (!this.map.has(version.id)) throw new Error(`找不到版本：${version.id}`);
    this.map.set(version.id, version);
  }

  async listByPage(tenantId: string, pageId: string): Promise<LpVersion[]> {
    return Array.from(this.map.values())
      .filter((v) => v.tenantId === tenantId && v.pageId === pageId)
      .sort((a, b) => b.version - a.version);
  }

  async findProduction(tenantId: string, pageId: string): Promise<LpVersion | undefined> {
    return Array.from(this.map.values()).find(
      (v) => v.tenantId === tenantId && v.pageId === pageId && v.isProduction,
    );
  }
}

/** In-memory 預覽連結。 */
export class InMemoryPreviewLinkStore implements PreviewLinkStore {
  private map = new Map<string, PreviewLink>();

  async insert(link: PreviewLink): Promise<void> {
    this.map.set(link.token, link);
  }

  async findByToken(token: string): Promise<PreviewLink | undefined> {
    return this.map.get(token);
  }
}
