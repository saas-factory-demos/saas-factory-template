/**
 * @saas-factory/shop-orders
 *
 * 訂單模組（goal 03 §7）。
 *
 * Lock：ADR-0011 §03-07 v1。
 */

export type { Order, OrderItem, OrderNumberOptions, OrderStatus } from './types.js';
export { canTransition, isTerminal, nextStates } from './state-machine.js';
export { generateOrderNumber, parseOrderNumber } from './order-number.js';
export { OrderService } from './service.js';
export type { OrderServiceConfig } from './service.js';
export { OrderSequenceCollection, OrdersCollection } from './collections.js';
