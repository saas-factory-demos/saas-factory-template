/**
 * Domain event 型別定義。
 *
 * 規則：
 * - 所有事件名格式為 `<domain>.<action>`（例：`order.completed`）。
 * - 所有 payload 必含 `tenantId`（除非註明為全域系統事件）。
 * - 新增事件型別時請同步更新 ADR-0010 §10 與 docs/decisions/_pending-questions.md。
 */

export type DomainEvent =
  // === 訂單（goal 03 接收所有權）===
  | {
      type: 'order.created';
      payload: {
        orderId: string;
        tenantId: string;
        userId?: string;
        total: number;
        itemCount: number;
      };
    }
  | {
      type: 'order.completed';
      payload: { orderId: string; tenantId: string; total: number };
    }
  | {
      type: 'order.paid';
      payload: { orderId: string; tenantId: string; paidAt: string };
    }
  | {
      type: 'order.shipped';
      payload: { orderId: string; tenantId: string; trackingNo?: string };
    }
  | {
      type: 'order.cancelled';
      payload: { orderId: string; tenantId: string; reason?: string };
    }
  | {
      type: 'order.refunded';
      payload: {
        orderId: string;
        tenantId: string;
        amount: number;
        reason?: string;
      };
    }
  // === 退換貨（ADR-0006）===
  | {
      type: 'return.received';
      payload: { returnId: string; tenantId: string };
    }
  | {
      type: 'return.refunded';
      payload: { returnId: string; tenantId: string; amount: number };
    }
  // === 會員等級（goal 03 §8）===
  | {
      type: 'member.tier-changed';
      payload: {
        userId: string;
        tenantId: string;
        fromTier: string | null;
        toTier: string;
        reason: 'upgrade' | 'downgrade' | 'manual';
      };
    }
  // === 點數（goal 03 §9）===
  | {
      type: 'points.earned';
      payload: {
        userId: string;
        tenantId: string;
        amount: number;
        source: 'order' | 'manual' | 'campaign';
        sourceId?: string;
      };
    }
  | {
      type: 'points.redeemed';
      payload: {
        userId: string;
        tenantId: string;
        amount: number;
        orderId?: string;
      };
    }
  | {
      type: 'points.expired';
      payload: { userId: string; tenantId: string; amount: number };
    }
  // === 認證 ===
  | {
      type: 'auth.registered';
      payload: { userId: string; tenantId: string; channel: 'email' | 'phone' };
    }
  | {
      type: 'auth.login';
      payload: { userId: string; tenantId: string; ip: string };
    }
  | {
      type: 'auth.login_failed';
      payload: { email?: string; phone?: string; ip: string; reason: string };
    }
  // === 發票（goal 02 接收所有權）===
  | {
      type: 'invoice.issued';
      payload: {
        invoiceId: string;
        invoiceNumber: string;
        orderId: string;
        tenantId: string;
        totalAmount: number;
      };
    }
  | {
      type: 'invoice.allowance-created';
      payload: {
        allowanceId: string;
        invoiceId: string;
        tenantId: string;
        amount: number;
        reason?: string;
      };
    }
  | {
      type: 'invoice.voided';
      payload: { invoiceId: string; tenantId: string; reason?: string };
    }
  // === 訂閱（goal 03 §12）===
  | {
      type: 'subscription.created';
      payload: { subscriptionId: string; tenantId: string; userId: string };
    }
  | {
      type: 'subscription.renewal-scheduled';
      payload: {
        subscriptionId: string;
        tenantId: string;
        userId: string;
        nextRunAt: string;
      };
    }
  | {
      type: 'subscription.renewal-failed';
      payload: {
        subscriptionId: string;
        tenantId: string;
        userId: string;
        attempt: number;
        reason?: string;
      };
    }
  | {
      type: 'subscription.cancelled';
      payload: { subscriptionId: string; tenantId: string; userId: string; reason?: string };
    }
  | {
      type: 'subscription.paused';
      payload: { subscriptionId: string; tenantId: string; userId: string; until?: string };
    }
  | {
      type: 'subscription.resumed';
      payload: { subscriptionId: string; tenantId: string; userId: string };
    }
  | {
      type: 'subscription.card-expiring';
      payload: { subscriptionId: string; tenantId: string; userId: string; expiresAt: string };
    }
  // === 結帳 ===
  | {
      type: 'checkout.inventory-release-failed';
      payload: { orderId: string; tenantId: string; reason: string };
    }
  // === 課程 ===
  | {
      type: 'course.enrolled';
      payload: { courseId: string; customerId: string; tenantId: string };
    }
  | {
      type: 'course.completed';
      payload: { courseId: string; customerId: string; tenantId: string };
    };

export type DomainEventType = DomainEvent['type'];

export type DomainEventHandler<T extends DomainEventType = DomainEventType> = (
  event: Extract<DomainEvent, { type: T }>,
) => void | Promise<void>;
