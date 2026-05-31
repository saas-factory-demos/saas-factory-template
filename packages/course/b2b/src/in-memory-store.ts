import type { B2BAccount, B2BLearner, B2BStore } from './types.js';

/** 記憶體版 B2BStore。 */
export class InMemoryB2BStore implements B2BStore {
  private readonly accounts = new Map<string, B2BAccount>();
  private readonly learners = new Map<string, B2BLearner>();

  async getAccount(id: string): Promise<B2BAccount | undefined> {
    return this.accounts.get(id);
  }

  async upsertAccount(a: B2BAccount): Promise<void> {
    this.accounts.set(a.id, a);
  }

  async findAccountByDomain(tenantId: string, domain: string): Promise<B2BAccount | undefined> {
    for (const a of this.accounts.values()) {
      if (a.tenantId === tenantId && a.domains.includes(domain)) return a;
    }
    return undefined;
  }

  async upsertLearner(l: B2BLearner): Promise<void> {
    this.learners.set(l.id, l);
  }

  async findLearnerByEmail(
    b2bAccountId: string,
    email: string,
  ): Promise<B2BLearner | undefined> {
    const lower = email.toLowerCase();
    for (const l of this.learners.values()) {
      if (l.b2bAccountId === b2bAccountId && l.email.toLowerCase() === lower) return l;
    }
    return undefined;
  }

  async listLearners(b2bAccountId: string): Promise<B2BLearner[]> {
    return Array.from(this.learners.values()).filter((l) => l.b2bAccountId === b2bAccountId);
  }
}
