/**
 * @saas-factory/shop-cart
 *
 * 購物車模組（goal 03 §3）。
 *
 * Lock：ADR-0011 §03-03 v1。
 */

export type {
  Cart,
  CartItem,
  CartStore,
  FreeShippingProgress,
  FreeShippingThreshold,
  ProductStatusChecker,
} from './types.js';
export { CART_RETENTION_DAYS } from './types.js';
export { CartService, calcSubtotal, calcFreeShippingProgress } from './service.js';
export type { CartServiceConfig } from './service.js';
export { InMemoryCartStore } from './in-memory-store.js';
