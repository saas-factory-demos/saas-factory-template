/**
 * 測試用 in-memory store。
 */

import type { ReturnRequest, ReturnStore } from './types.js';

export class InMemoryReturnStore implements ReturnStore {
  requests = new Map<string, ReturnRequest>();

  async get(id: string): Promise<ReturnRequest | null> {
    return this.requests.get(id) ?? null;
  }

  async save(request: ReturnRequest): Promise<void> {
    this.requests.set(request.id, request);
  }

  async listByOrder(orderId: string): Promise<ReturnRequest[]> {
    return Array.from(this.requests.values()).filter((r) => r.orderId === orderId);
  }
}
