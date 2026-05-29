/**
 * 測試用 in-memory store。
 */

import type { PointsBatch, PointsLedger, PointsStore } from './types.js';

export class InMemoryPointsStore implements PointsStore {
  batches = new Map<string, PointsBatch>();
  ledger: PointsLedger[] = [];

  async listActiveBatches(userId: string, tenantId: string, now: Date): Promise<PointsBatch[]> {
    return Array.from(this.batches.values()).filter(
      (b) =>
        b.userId === userId &&
        b.tenantId === tenantId &&
        !b.expired &&
        b.amount - b.consumed > 0 &&
        (!b.expiresAt || new Date(b.expiresAt).getTime() > now.getTime()),
    );
  }

  async listAllBatches(userId: string, tenantId: string): Promise<PointsBatch[]> {
    return Array.from(this.batches.values()).filter(
      (b) => b.userId === userId && b.tenantId === tenantId,
    );
  }

  async saveBatch(batch: PointsBatch): Promise<void> {
    this.batches.set(batch.id, batch);
  }

  async updateBatch(batch: PointsBatch): Promise<void> {
    this.batches.set(batch.id, batch);
  }

  async appendLedger(entry: PointsLedger): Promise<void> {
    this.ledger.push(entry);
  }
}
