import { InventoryVersionConflictError } from './types.js';

import type {
  InventoryItem,
  InventoryReservation,
  InventoryStore,
} from './types.js';

/**
 * 記憶體用 InventoryStore（測試 / 開發用）。生產用 DB 實作。
 */
export class InMemoryInventoryStore implements InventoryStore {
  private readonly items = new Map<string, InventoryItem>();
  private readonly reservations = new Map<string, InventoryReservation>();

  addItem(item: InventoryItem): void {
    this.items.set(item.id, { ...item });
  }

  async getItem(variantId: string, warehouseId: string): Promise<InventoryItem | null> {
    for (const i of this.items.values()) {
      if (i.variantId === variantId && i.warehouseId === warehouseId) return i;
    }
    return null;
  }

  async listItemsByVariant(variantId: string): Promise<InventoryItem[]> {
    const list: InventoryItem[] = [];
    for (const i of this.items.values()) {
      if (i.variantId === variantId) list.push(i);
    }
    return list.sort((a, b) => a.warehouseId.localeCompare(b.warehouseId));
  }

  async createReservation(reservation: InventoryReservation): Promise<void> {
    this.reservations.set(reservation.id, reservation);
  }

  async updateReservation(
    id: string,
    patch: Partial<InventoryReservation>,
  ): Promise<void> {
    const existing = this.reservations.get(id);
    if (!existing) return;
    this.reservations.set(id, { ...existing, ...patch });
  }

  async listExpiredReservations(now: number): Promise<InventoryReservation[]> {
    return [...this.reservations.values()].filter(
      (r) => r.status === 'held' && r.expiresAt <= now,
    );
  }

  async updateItem(
    id: string,
    patch: Partial<InventoryItem>,
    expectedVersion?: number,
  ): Promise<void> {
    const existing = this.items.get(id);
    if (!existing) return;
    if (expectedVersion !== undefined && existing.version !== expectedVersion) {
      throw new InventoryVersionConflictError(id, expectedVersion, existing.version);
    }
    this.items.set(id, {
      ...existing,
      ...patch,
      version: existing.version + 1,
    });
  }
}
