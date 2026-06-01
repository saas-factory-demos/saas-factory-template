import type { LpDomainBindingStore } from './in-memory-store.js';
import type { DomainRouteResolution, LpDomainBinding } from './types.js';

/** DNS TXT 查詢 hook（外層接 dns / Cloudflare API）。 */
export type DnsTxtResolver = (domain: string) => Promise<string[]>;

/** 多 LP 同後台服務：每個 LP 可繫結獨立網域。 */
export class LpMultiDomainService {
  constructor(
    private readonly store: LpDomainBindingStore,
    private readonly options: {
      now?: () => Date;
      genId?: () => string;
      genToken?: () => string;
      dnsResolver?: DnsTxtResolver;
      verificationRecordHost?: (domain: string) => string;
    } = {},
  ) {}

  private now(): Date {
    return this.options.now ? this.options.now() : new Date();
  }

  private genId(): string {
    return this.options.genId ? this.options.genId() : `dom_${Math.random().toString(36).slice(2, 10)}`;
  }

  private genToken(): string {
    return this.options.genToken
      ? this.options.genToken()
      : `saas-factory-verify=${Math.random().toString(36).slice(2, 12)}`;
  }

  /** 新增網域繫結（pending 狀態，等 DNS 驗證）。 */
  async addDomain(input: {
    tenantId: string;
    pageId: string;
    domain: string;
    isPrimary?: boolean;
  }): Promise<LpDomainBinding> {
    const normalized = this.normalize(input.domain);
    if (!this.isValidDomain(normalized)) {
      throw new Error(`無效網域：${input.domain}`);
    }
    const existing = await this.store.findByDomain(normalized);
    if (existing) throw new Error(`網域已被使用：${normalized}`);
    const binding: LpDomainBinding = {
      id: this.genId(),
      tenantId: input.tenantId,
      pageId: input.pageId,
      domain: normalized,
      isPrimary: input.isPrimary ?? false,
      verificationStatus: 'pending',
      verificationToken: this.genToken(),
      createdAt: this.now(),
    };
    await this.store.insert(binding);
    if (binding.isPrimary) await this.ensureOnlyOnePrimary(binding);
    return binding;
  }

  /** 驗證：查 DNS TXT，包含 token 才標 verified。 */
  async verify(id: string): Promise<LpDomainBinding> {
    const b = await this.store.findById(id);
    if (!b) throw new Error(`找不到繫結：${id}`);
    if (!this.options.dnsResolver) throw new Error('未注入 dnsResolver');
    const host = this.options.verificationRecordHost
      ? this.options.verificationRecordHost(b.domain)
      : `_saas-factory.${b.domain}`;
    const txts = await this.options.dnsResolver(host);
    if (!txts.includes(b.verificationToken)) {
      const failed: LpDomainBinding = { ...b, verificationStatus: 'failed' };
      await this.store.update(failed);
      return failed;
    }
    const verified: LpDomainBinding = {
      ...b,
      verificationStatus: 'verified',
      verifiedAt: this.now(),
    };
    await this.store.update(verified);
    return verified;
  }

  /** Middleware 路由解析：把 hostname → pageId。只回 verified 的繫結。 */
  async resolveDomain(hostname: string): Promise<DomainRouteResolution | undefined> {
    const normalized = this.normalize(hostname);
    const b = await this.store.findByDomain(normalized);
    if (!b || b.verificationStatus !== 'verified') return undefined;
    return {
      tenantId: b.tenantId,
      pageId: b.pageId,
      domain: b.domain,
      isPrimary: b.isPrimary,
    };
  }

  /** 設定 primary（每個 page 只能一個 primary）。 */
  async setPrimary(id: string): Promise<LpDomainBinding> {
    const b = await this.store.findById(id);
    if (!b) throw new Error(`找不到繫結：${id}`);
    const updated: LpDomainBinding = { ...b, isPrimary: true };
    await this.store.update(updated);
    await this.ensureOnlyOnePrimary(updated);
    return updated;
  }

  /** 移除繫結。 */
  async removeDomain(id: string): Promise<void> {
    await this.store.delete(id);
  }

  /** 列出 tenant 全部繫結。 */
  async listByTenant(tenantId: string) {
    return this.store.listByTenant(tenantId);
  }

  /** 取得 page 的 primary 繫結（給分享連結用）。 */
  async getPrimary(tenantId: string, pageId: string): Promise<LpDomainBinding | undefined> {
    const list = await this.store.listByPage(tenantId, pageId);
    return list.find((b) => b.isPrimary) ?? list[0];
  }

  private async ensureOnlyOnePrimary(target: LpDomainBinding): Promise<void> {
    const siblings = await this.store.listByPage(target.tenantId, target.pageId);
    for (const s of siblings) {
      if (s.id === target.id) continue;
      if (s.isPrimary) {
        await this.store.update({ ...s, isPrimary: false });
      }
    }
  }

  private normalize(domain: string): string {
    return domain.trim().toLowerCase().replace(/^https?:\/\//u, '').replace(/\/$/u, '');
  }

  private isValidDomain(domain: string): boolean {
    return /^([a-z0-9-]+\.)+[a-z]{2,}$/u.test(domain);
  }
}
