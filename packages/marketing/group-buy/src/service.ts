import { randomBytes } from 'node:crypto';

import type { GroupBuyDealStore, GroupBuyOrderStore } from './in-memory-store.js';
import type { GroupBuyDeal, GroupBuyOrder, SettlementResult } from './types.js';

/** 退款處理器（呼叫金流退款 API 的注入點）。 */
export type RefundHandler = (input: {
  paymentOrderId: string;
  amountMinor: number;
}) => Promise<{ ok: boolean }>;

/** 成團通知處理器（寄 LINE 群連結等）。 */
export type SuccessNotifier = (input: {
  deal: GroupBuyDeal;
  members: GroupBuyOrder[];
}) => Promise<void>;

/** 團購服務。 */
export class GroupBuyService {
  constructor(
    private readonly deals: GroupBuyDealStore,
    private readonly orders: GroupBuyOrderStore,
    private readonly handlers: { refund: RefundHandler; notify: SuccessNotifier },
    private readonly options: { now?: () => Date; genId?: () => string } = {},
  ) {}

  private now(): Date {
    return this.options.now ? this.options.now() : new Date();
  }

  private genId(prefix: string): string {
    if (this.options.genId) return this.options.genId();
    return `${prefix}_${randomBytes(5).toString('hex')}`;
  }

  /** 建立 deal。 */
  async createDeal(
    input: Omit<GroupBuyDeal, 'id' | 'status' | 'createdAt'>,
  ): Promise<GroupBuyDeal> {
    if (input.deadlineAt <= this.now()) throw new Error('deadlineAt 必須晚於現在');
    if (input.minMembers < 2) throw new Error('minMembers 至少 2');
    const d: GroupBuyDeal = {
      ...input,
      id: this.genId('gb'),
      status: 'open',
      createdAt: this.now(),
    };
    await this.deals.insert(d);
    return d;
  }

  /** 客戶報名（已先在金流完成預授權 / 收款）。 */
  async join(input: {
    dealId: string;
    customerId: string;
    paymentOrderId: string;
    at: Date;
  }): Promise<GroupBuyOrder> {
    const deal = await this.deals.findById(input.dealId);
    if (!deal) throw new Error(`找不到 deal：${input.dealId}`);
    if (deal.status !== 'open') throw new Error(`deal 已 ${deal.status}`);
    if (input.at >= deal.deadlineAt) throw new Error('已過截止時間');
    const all = await this.orders.listByDeal(deal.id);
    if (deal.maxMembers !== undefined && all.length >= deal.maxMembers) {
      throw new Error('已達上限');
    }
    if (all.some((o) => o.customerId === input.customerId && o.status !== 'cancelled')) {
      throw new Error('已報名過');
    }
    const order: GroupBuyOrder = {
      id: this.genId('go'),
      tenantId: deal.tenantId,
      dealId: deal.id,
      customerId: input.customerId,
      paymentOrderId: input.paymentOrderId,
      amountMinor: deal.unitPriceMinor,
      status: 'pending',
      joinedAt: input.at,
    };
    await this.orders.insert(order);

    // 報名同時若達門檻，立即成團
    if (all.filter((o) => o.status !== 'cancelled').length + 1 >= deal.minMembers) {
      await this.settle(deal.id);
    }
    return order;
  }

  /** 客戶取消報名（截止前才允許）。 */
  async cancelJoin(orderId: string): Promise<GroupBuyOrder> {
    const o = await this.orders.findById(orderId);
    if (!o) throw new Error(`找不到 order：${orderId}`);
    const deal = await this.deals.findById(o.dealId);
    if (!deal) throw new Error(`找不到 deal：${o.dealId}`);
    if (deal.status !== 'open') throw new Error('deal 已結算');
    const updated: GroupBuyOrder = { ...o, status: 'cancelled' };
    await this.orders.update(updated);
    await this.handlers.refund({
      paymentOrderId: o.paymentOrderId,
      amountMinor: o.amountMinor,
    });
    return updated;
  }

  /** 結算：達門檻 → 成團 + 通知；未達 → 失敗 + 全退。 */
  async settle(dealId: string): Promise<SettlementResult> {
    const deal = await this.deals.findById(dealId);
    if (!deal) throw new Error(`找不到 deal：${dealId}`);
    if (deal.status !== 'open') throw new Error(`deal 已 ${deal.status}`);
    const all = await this.orders.listByDeal(deal.id);
    const active = all.filter((o) => o.status === 'pending');
    const now = this.now();

    if (active.length >= deal.minMembers) {
      // 成團
      for (const o of active) {
        await this.orders.update({ ...o, status: 'confirmed' });
      }
      const updated: GroupBuyDeal = {
        ...deal,
        status: 'succeeded',
        succeededAt: now,
        settledAt: now,
      };
      await this.deals.update(updated);
      await this.handlers.notify({ deal: updated, members: active });
      return {
        deal: updated,
        outcome: 'succeeded',
        totalMembers: active.length,
        refundedOrderIds: [],
      };
    }

    // 未達門檻
    const refunded: string[] = [];
    for (const o of active) {
      const updated: GroupBuyOrder = { ...o, status: 'refunded' };
      await this.orders.update(updated);
      await this.handlers.refund({
        paymentOrderId: o.paymentOrderId,
        amountMinor: o.amountMinor,
      });
      refunded.push(o.id);
    }
    const updatedDeal: GroupBuyDeal = { ...deal, status: 'failed', settledAt: now };
    await this.deals.update(updatedDeal);
    return {
      deal: updatedDeal,
      outcome: 'failed',
      totalMembers: active.length,
      refundedOrderIds: refunded,
    };
  }

  /** Cron：到期但仍 open 的 deal 全部結算。 */
  async settleDue(tenantId: string, now: Date = this.now()): Promise<SettlementResult[]> {
    const due = await this.deals.listOpenDue(tenantId, now);
    const out: SettlementResult[] = [];
    for (const d of due) {
      out.push(await this.settle(d.id));
    }
    return out;
  }
}
