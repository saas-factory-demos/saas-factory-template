import type { AdSpendEntry, LpEvent } from './types.js';

/** 事件儲存介面。 */
export interface LpEventStore {
  insert(event: LpEvent): Promise<void>;
  listByPage(tenantId: string, pageId: string, range?: { from?: Date; to?: Date }): Promise<LpEvent[]>;
}

/** 廣告花費儲存介面。 */
export interface AdSpendStore {
  upsert(entry: AdSpendEntry): Promise<void>;
  listByPage(tenantId: string, pageId: string): Promise<AdSpendEntry[]>;
}

/** In-memory 事件實作。 */
export class InMemoryLpEventStore implements LpEventStore {
  private events: LpEvent[] = [];

  async insert(event: LpEvent): Promise<void> {
    this.events.push(event);
  }

  async listByPage(tenantId: string, pageId: string, range?: { from?: Date; to?: Date }) {
    return this.events.filter((e) => {
      if (e.tenantId !== tenantId || e.pageId !== pageId) return false;
      if (range?.from && e.occurredAt < range.from) return false;
      if (range?.to && e.occurredAt > range.to) return false;
      return true;
    });
  }
}

/** In-memory 花費實作（同 page+campaign+date 視為同一筆）。 */
export class InMemoryAdSpendStore implements AdSpendStore {
  private entries = new Map<string, AdSpendEntry>();

  private key(e: Pick<AdSpendEntry, 'tenantId' | 'pageId' | 'campaign' | 'date'>): string {
    return `${e.tenantId}|${e.pageId}|${e.campaign}|${e.date}`;
  }

  async upsert(entry: AdSpendEntry): Promise<void> {
    this.entries.set(this.key(entry), entry);
  }

  async listByPage(tenantId: string, pageId: string) {
    return Array.from(this.entries.values()).filter(
      (e) => e.tenantId === tenantId && e.pageId === pageId,
    );
  }
}
