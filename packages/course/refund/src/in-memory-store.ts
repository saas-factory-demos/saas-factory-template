import type { RefundPolicy, RefundRequest, RefundStore } from './types.js';

/** 記憶體版 RefundStore。 */
export class InMemoryRefundStore implements RefundStore {
  private readonly policies = new Map<string, RefundPolicy>();
  private readonly requests = new Map<string, RefundRequest>();

  async upsertPolicy(p: RefundPolicy): Promise<void> {
    this.policies.set(p.id, p);
  }

  async findPolicy(tenantId: string, courseId: string): Promise<RefundPolicy | undefined> {
    let tenantDefault: RefundPolicy | undefined;
    for (const p of this.policies.values()) {
      if (p.tenantId !== tenantId) continue;
      if (p.scope === 'course' && p.courseId === courseId) return p;
      if (p.scope === 'tenant') tenantDefault = p;
    }
    return tenantDefault;
  }

  async upsertRequest(r: RefundRequest): Promise<void> {
    this.requests.set(r.id, r);
  }

  async getRequest(id: string): Promise<RefundRequest | undefined> {
    return this.requests.get(id);
  }

  async listByOrder(orderId: string): Promise<RefundRequest[]> {
    return Array.from(this.requests.values()).filter((r) => r.orderId === orderId);
  }
}
