/**
 * @saas-factory/shop-inventory
 *
 * 庫存模組（goal 03 §2）。
 *
 * Lock：ADR-0011 §03-02 v1。
 */

export type {
  InventoryItem,
  InventoryReservation,
  InventoryStore,
  RestockSubscription,
  ReserveRequest,
  ReserveResult,
  Warehouse,
} from './types.js';
export { DEFAULT_RESERVE_TTL_SECONDS, InventoryVersionConflictError } from './types.js';
export { InventoryService } from './service.js';
export type { InventoryServiceConfig } from './service.js';
export { InMemoryInventoryStore } from './in-memory-store.js';
export {
  InventoryItemsCollection,
  InventoryReservationsCollection,
  RestockSubscriptionsCollection,
  WarehousesCollection,
} from './collections.js';
