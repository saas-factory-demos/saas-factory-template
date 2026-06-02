import type { CommunicationChannel, CommunicationEntry } from './types.js';

/**
 * CommunicationLog 寫入 / 查詢介面。
 *
 * Production 由 Payload Collection 實作；測試用 in-memory 版本。
 */
export interface CommunicationLogStore {
  append(entry: CommunicationEntry): Promise<void>;
  listByCustomer(
    customerId: string,
    options?: { channels?: CommunicationChannel[]; limit?: number },
  ): Promise<CommunicationEntry[]>;
}

export class InMemoryCommunicationLog implements CommunicationLogStore {
  private readonly entries: CommunicationEntry[] = [];

  append(entry: CommunicationEntry): Promise<void> {
    this.entries.push(entry);
    return Promise.resolve();
  }

  listByCustomer(
    customerId: string,
    options: { channels?: CommunicationChannel[]; limit?: number } = {},
  ): Promise<CommunicationEntry[]> {
    let rows = this.entries.filter((e) => e.customerId === customerId);
    if (options.channels && options.channels.length > 0) {
      const set = new Set(options.channels);
      rows = rows.filter((e) => set.has(e.channel));
    }
    rows = rows.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
    if (options.limit && options.limit > 0) {
      rows = rows.slice(0, options.limit);
    }
    return Promise.resolve(rows);
  }
}
