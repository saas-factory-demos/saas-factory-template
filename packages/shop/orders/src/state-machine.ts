import type { OrderStatus } from './types.js';

/**
 * 合法的狀態轉換表。
 */
/**
 * 注意：`refund-requested → paid` 已移除（PR #4 review B1）。
 * 若需要「取消退款申請」，請走專屬 op + 對應 event，避免 markPaid 重新觸發
 * order.paid 事件導致重複發放點數 / 重複出貨 / 重複開立發票。
 */
const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  draft: ['pending-payment', 'cancelled'],
  'pending-payment': ['paid', 'cancelled'],
  paid: ['preparing', 'refund-requested', 'cancelled'],
  preparing: ['shipped', 'refund-requested', 'cancelled'],
  shipped: ['delivered', 'refund-requested'],
  delivered: ['completed', 'refund-requested'],
  completed: ['refund-requested'],
  'refund-requested': ['refunded'],
  refunded: [],
  cancelled: [],
};

/**
 * 檢查狀態轉換是否合法。
 */
export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

/**
 * 取得 from 可轉到的下一個狀態 list。
 */
export function nextStates(from: OrderStatus): OrderStatus[] {
  return [...TRANSITIONS[from]];
}

/**
 * 終止狀態（不可再轉）。
 */
export function isTerminal(status: OrderStatus): boolean {
  return TRANSITIONS[status].length === 0;
}
