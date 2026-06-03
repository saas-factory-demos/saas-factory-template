/**
 * 測試用 in-memory store。
 */

import type { MemberTier, MemberTierStatus, MemberTierStore } from './types.js';

export class InMemoryMemberTierStore implements MemberTierStore {
  private tiers: MemberTier[] = [];
  private statuses = new Map<string, MemberTierStatus>();

  setTiers(tiers: MemberTier[]): void {
    this.tiers = tiers;
  }

  async listTiers(tenantId: string): Promise<MemberTier[]> {
    return this.tiers.filter((t) => t.tenantId === tenantId);
  }

  async getStatus(userId: string, tenantId: string): Promise<MemberTierStatus | null> {
    return this.statuses.get(`${tenantId}:${userId}`) ?? null;
  }

  async saveStatus(status: MemberTierStatus): Promise<void> {
    this.statuses.set(`${status.tenantId}:${status.userId}`, status);
  }
}
