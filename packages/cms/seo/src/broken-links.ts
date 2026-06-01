import type { BrokenLink, BrokenLinkStore } from './types.js';

/**
 * 記憶體版 BrokenLinkStore（測試 + 開發用）。
 *
 * 同 path 多次命中 → 累加 hitCount + 更新 lastSeenAt。
 */
export class InMemoryBrokenLinkStore implements BrokenLinkStore {
  private readonly items = new Map<string, BrokenLink>();

  private key(tenantId: string, path: string): string {
    return `${tenantId}::${path}`;
  }

  async recordHit(input: {
    tenantId: string;
    path: string;
    referrer?: string;
  }): Promise<BrokenLink> {
    const k = this.key(input.tenantId, input.path);
    const now = new Date();
    const cur = this.items.get(k);
    if (cur) {
      const next: BrokenLink = {
        ...cur,
        hitCount: cur.hitCount + 1,
        lastSeenAt: now,
        referrer: input.referrer ?? cur.referrer,
      };
      this.items.set(k, next);
      return next;
    }
    const created: BrokenLink = {
      id: `bl_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      tenantId: input.tenantId,
      path: input.path,
      referrer: input.referrer,
      hitCount: 1,
      resolved: false,
      firstSeenAt: now,
      lastSeenAt: now,
    };
    this.items.set(k, created);
    return created;
  }

  async list(tenantId: string, opts: { resolved?: boolean } = {}): Promise<BrokenLink[]> {
    const out: BrokenLink[] = [];
    for (const it of this.items.values()) {
      if (it.tenantId !== tenantId) continue;
      if (opts.resolved !== undefined && it.resolved !== opts.resolved) continue;
      out.push(it);
    }
    return out.sort((a, b) => b.hitCount - a.hitCount);
  }

  async markResolved(id: string): Promise<BrokenLink> {
    for (const [k, v] of this.items) {
      if (v.id === id) {
        const next = { ...v, resolved: true };
        this.items.set(k, next);
        return next;
      }
    }
    throw new Error(`BrokenLink 不存在：${id}`);
  }
}
