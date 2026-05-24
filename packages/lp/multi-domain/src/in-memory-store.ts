import type { LpDomainBinding } from './types.js';

/** 網域繫結儲存介面。 */
export interface LpDomainBindingStore {
  insert(binding: LpDomainBinding): Promise<void>;
  findByDomain(domain: string): Promise<LpDomainBinding | undefined>;
  findById(id: string): Promise<LpDomainBinding | undefined>;
  update(binding: LpDomainBinding): Promise<void>;
  listByTenant(tenantId: string): Promise<LpDomainBinding[]>;
  listByPage(tenantId: string, pageId: string): Promise<LpDomainBinding[]>;
  delete(id: string): Promise<void>;
}

/** In-memory 實作。 */
export class InMemoryLpDomainBindingStore implements LpDomainBindingStore {
  private byId = new Map<string, LpDomainBinding>();
  private byDomain = new Map<string, string>();

  async insert(binding: LpDomainBinding): Promise<void> {
    if (this.byDomain.has(binding.domain)) {
      throw new Error(`網域已被使用：${binding.domain}`);
    }
    this.byId.set(binding.id, binding);
    this.byDomain.set(binding.domain, binding.id);
  }

  async findByDomain(domain: string): Promise<LpDomainBinding | undefined> {
    const id = this.byDomain.get(domain);
    return id ? this.byId.get(id) : undefined;
  }

  async findById(id: string): Promise<LpDomainBinding | undefined> {
    return this.byId.get(id);
  }

  async update(binding: LpDomainBinding): Promise<void> {
    if (!this.byId.has(binding.id)) throw new Error(`找不到繫結：${binding.id}`);
    this.byId.set(binding.id, binding);
  }

  async listByTenant(tenantId: string): Promise<LpDomainBinding[]> {
    return Array.from(this.byId.values()).filter((b) => b.tenantId === tenantId);
  }

  async listByPage(tenantId: string, pageId: string): Promise<LpDomainBinding[]> {
    return Array.from(this.byId.values()).filter(
      (b) => b.tenantId === tenantId && b.pageId === pageId,
    );
  }

  async delete(id: string): Promise<void> {
    const b = this.byId.get(id);
    if (!b) return;
    this.byId.delete(id);
    this.byDomain.delete(b.domain);
  }
}
