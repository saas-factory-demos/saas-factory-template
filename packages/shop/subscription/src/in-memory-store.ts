/**
 * 測試用 in-memory store。
 */

import type { Subscription, SubscriptionStore } from './types.js';

export class InMemorySubscriptionStore implements SubscriptionStore {
  subs = new Map<string, Subscription>();

  async get(id: string): Promise<Subscription | null> {
    return this.subs.get(id) ?? null;
  }

  async save(sub: Subscription): Promise<void> {
    this.subs.set(sub.id, sub);
  }

  async listDue(tenantId: string, now: Date): Promise<Subscription[]> {
    return Array.from(this.subs.values()).filter(
      (s) =>
        s.tenantId === tenantId &&
        (s.status === 'active' || s.status === 'past-due') &&
        new Date(s.nextRunAt).getTime() <= now.getTime(),
    );
  }

  async listExpiringCards(tenantId: string, withinDays: number, now: Date): Promise<Subscription[]> {
    const threshold = now.getTime() + withinDays * 86400000;
    return Array.from(this.subs.values()).filter((s) => {
      if (s.tenantId !== tenantId || s.status !== 'active') return false;
      const [y, m] = s.cardExpiresAt.split('-').map(Number);
      // 卡片到期月份的月底。
      const expiry = new Date(Date.UTC(y ?? 0, m ?? 0, 0)).getTime();
      return expiry <= threshold && expiry >= now.getTime();
    });
  }
}
