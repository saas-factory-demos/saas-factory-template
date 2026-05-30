/**
 * 退換貨服務。
 */

import type {
  CreateReturnInput,
  InvoiceAllowanceIssuer,
  ReturnRequest,
  ReturnStatus,
  ReturnStore,
} from './types.js';
import type { DomainEvent } from '@saas-factory/events';


export interface ReturnServiceConfig {
  emit?: (event: DomainEvent) => void;
  now?: () => Date;
  idGenerator?: () => string;
  /** 鑑賞期（預設 7 天）。 */
  coolingPeriodDays?: number;
}

/**
 * 合法狀態轉換表。
 */
const TRANSITIONS: Record<ReturnStatus, ReturnStatus[]> = {
  pending: ['approved', 'rejected', 'cancelled'],
  approved: ['received', 'cancelled'],
  received: ['refunded', 'exchanged', 'rejected'],
  refunded: [],
  exchanged: [],
  rejected: [],
  cancelled: [],
};

/**
 * 退換貨服務：申請 → 審核 → 收件 → 退款 / 換貨。
 *
 * 發票折讓串接 goal 02 invoice-core.issueAllowance（不擴充發票 schema）。
 */
export class ReturnService {
  constructor(
    private readonly store: ReturnStore,
    private readonly config: ReturnServiceConfig = {},
  ) {}

  private now(): Date {
    return this.config.now?.() ?? new Date();
  }

  private genId(): string {
    return this.config.idGenerator?.() ?? `id-${this.now().getTime()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  /**
   * 顧客建立退換貨申請。
   */
  async createRequest(input: CreateReturnInput): Promise<ReturnRequest> {
    const at = this.now().toISOString();
    const withinCoolingPeriod = this.checkCoolingPeriod(input.orderDeliveredAt);
    const request: ReturnRequest = {
      id: this.genId(),
      tenantId: input.tenantId,
      orderId: input.orderId,
      userId: input.userId,
      kind: input.kind,
      reason: input.reason,
      reasonDetail: input.reasonDetail,
      items: input.items,
      refundAmount: input.refundAmount,
      shippingFeePayer: input.shippingFeePayer,
      status: 'pending',
      withinCoolingPeriod,
      statusHistory: [{ from: null, to: 'pending', at }],
      createdAt: at,
      updatedAt: at,
    };
    await this.store.save(request);
    return request;
  }

  /**
   * 商家審核通過。
   */
  async approve(id: string): Promise<ReturnRequest> {
    return this.transition(id, 'approved');
  }

  /**
   * 商家拒絕。
   */
  async reject(id: string, reason?: string): Promise<ReturnRequest> {
    return this.transition(id, 'rejected', (next) => {
      next.reasonDetail = reason ?? next.reasonDetail;
    });
  }

  /**
   * 商家收到退貨。
   */
  async markReceived(id: string): Promise<ReturnRequest> {
    const updated = await this.transition(id, 'received');
    this.config.emit?.({
      type: 'return.received',
      payload: { returnId: updated.id, tenantId: updated.tenantId },
    });
    return updated;
  }

  /**
   * 完成退款（含呼叫發票折讓）。
   */
  async completeRefund(input: {
    id: string;
    invoiceId: string;
    issuer: InvoiceAllowanceIssuer;
    reason?: string;
  }): Promise<ReturnRequest> {
    const current = await this.requireRequest(input.id);
    if (current.status !== 'received') {
      throw new Error('需先標記為已收到才能退款');
    }
    const allowance = await input.issuer.issueAllowance({
      invoiceId: input.invoiceId,
      amount: current.refundAmount,
      reason: input.reason,
    });
    const updated = await this.transition(input.id, 'refunded', (next) => {
      next.allowanceId = allowance.allowanceId;
    });
    this.config.emit?.({
      type: 'return.refunded',
      payload: {
        returnId: updated.id,
        tenantId: updated.tenantId,
        amount: updated.refundAmount,
      },
    });
    return updated;
  }

  /**
   * 標記為已換貨（新單需由 caller 先建好，傳 id 進來）。
   */
  async markExchanged(id: string, exchangeOrderId: string): Promise<ReturnRequest> {
    return this.transition(id, 'exchanged', (next) => {
      next.exchangeOrderId = exchangeOrderId;
    });
  }

  /**
   * 顧客取消申請。
   */
  async cancel(id: string): Promise<ReturnRequest> {
    return this.transition(id, 'cancelled');
  }

  private async transition(
    id: string,
    to: ReturnStatus,
    sideEffect?: (next: ReturnRequest) => void,
  ): Promise<ReturnRequest> {
    const current = await this.requireRequest(id);
    const allowed = TRANSITIONS[current.status];
    if (!allowed.includes(to)) {
      throw new Error(`illegal return transition: ${current.status} → ${to}`);
    }
    const at = this.now().toISOString();
    const next: ReturnRequest = {
      ...current,
      status: to,
      statusHistory: [...current.statusHistory, { from: current.status, to, at }],
      updatedAt: at,
    };
    sideEffect?.(next);
    await this.store.save(next);
    return next;
  }

  private async requireRequest(id: string): Promise<ReturnRequest> {
    const r = await this.store.get(id);
    if (!r) throw new Error('退換貨申請不存在');
    return r;
  }

  private checkCoolingPeriod(deliveredAt: Date | null): boolean {
    if (!deliveredAt) return false;
    const days = this.config.coolingPeriodDays ?? 7;
    const deadline = deliveredAt.getTime() + days * 86400000;
    return this.now().getTime() <= deadline;
  }
}
