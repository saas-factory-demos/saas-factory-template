import { canTransition } from './state-machine.js';

import type { Order, OrderStatus } from './types.js';
import type { DomainEvent } from '@saas-factory/events';

export interface OrderServiceConfig {
  emit?: (event: DomainEvent) => void;
  now?: () => Date;
}

/**
 * 訂單服務：狀態轉換 + DomainEvent emit。
 *
 * 訂單持久化由 caller 負責（Payload local API）。本服務只專注業務邏輯。
 */
export class OrderService {
  constructor(private readonly config: OrderServiceConfig = {}) {}

  private nowIso(): string {
    return (this.config.now?.() ?? new Date()).toISOString();
  }

  /**
   * 建立訂單草稿（不算 order.created 事件 — 須結帳送出才算）。
   */
  draft(seed: Omit<Order, 'status' | 'statusHistory' | 'createdAt' | 'updatedAt'>): Order {
    const at = this.nowIso();
    return {
      ...seed,
      status: 'draft',
      statusHistory: [{ from: null, to: 'draft', at }],
      createdAt: at,
      updatedAt: at,
    };
  }

  /**
   * 結帳送出，draft → pending-payment，emit order.created。
   */
  submit(order: Order): Order {
    return this.transition(order, 'pending-payment', (next) => {
      this.config.emit?.({
        type: 'order.created',
        payload: {
          orderId: next.id,
          tenantId: next.tenantId,
          userId: next.userId ?? undefined,
          total: next.total,
          itemCount: next.items.reduce((sum, i) => sum + i.quantity, 0),
        },
      });
    });
  }

  /**
   * 標記已付款，emit order.paid。
   */
  markPaid(order: Order): Order {
    const at = this.nowIso();
    return this.transition(order, 'paid', (next) => {
      this.config.emit?.({
        type: 'order.paid',
        payload: { orderId: next.id, tenantId: next.tenantId, paidAt: at },
      });
    });
  }

  /**
   * 開始備貨。
   */
  startPreparing(order: Order): Order {
    return this.transition(order, 'preparing');
  }

  /**
   * 已出貨，emit order.shipped。
   */
  markShipped(order: Order, trackingNumber?: string): Order {
    return this.transition(order, 'shipped', (next) => {
      next.trackingNumber = trackingNumber;
      this.config.emit?.({
        type: 'order.shipped',
        payload: {
          orderId: next.id,
          tenantId: next.tenantId,
          trackingNo: trackingNumber,
        },
      });
    });
  }

  /**
   * 已送達。
   */
  markDelivered(order: Order): Order {
    return this.transition(order, 'delivered');
  }

  /**
   * 訂單完成，emit order.completed。
   */
  complete(order: Order): Order {
    return this.transition(order, 'completed', (next) => {
      this.config.emit?.({
        type: 'order.completed',
        payload: { orderId: next.id, tenantId: next.tenantId, total: next.total },
      });
    });
  }

  /**
   * 取消訂單，emit order.cancelled。
   */
  cancel(order: Order, reason?: string): Order {
    return this.transition(order, 'cancelled', (next) => {
      this.config.emit?.({
        type: 'order.cancelled',
        payload: { orderId: next.id, tenantId: next.tenantId, reason },
      });
    });
  }

  /**
   * 申請退款。
   */
  requestRefund(order: Order): Order {
    return this.transition(order, 'refund-requested');
  }

  /**
   * 完成退款，emit order.refunded。
   */
  markRefunded(order: Order, amount: number, reason?: string): Order {
    return this.transition(order, 'refunded', (next) => {
      this.config.emit?.({
        type: 'order.refunded',
        payload: { orderId: next.id, tenantId: next.tenantId, amount, reason },
      });
    });
  }

  /**
   * 統一狀態轉換 + history 記錄。
   */
  private transition(
    order: Order,
    to: OrderStatus,
    sideEffect?: (next: Order) => void,
  ): Order {
    if (!canTransition(order.status, to)) {
      throw new Error(`illegal state transition: ${order.status} → ${to}`);
    }
    const at = this.nowIso();
    const next: Order = {
      ...order,
      status: to,
      statusHistory: [...order.statusHistory, { from: order.status, to, at }],
      updatedAt: at,
    };
    sideEffect?.(next);
    return next;
  }
}
