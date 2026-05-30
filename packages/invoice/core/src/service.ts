/**
 * 發票服務層（thin orchestrator）。
 *
 * 職責：
 * - 把 IssueInvoiceParams 委派給 InvoiceProvider（ezpay / ecpay-invoice）
 * - 成功後發出 domain event（invoice.issued / invoice.allowance-created / invoice.voided）
 * - 不直接觸碰 DB（DB 寫入由 apps 端的 Payload hook 處理；本服務僅負責「對外開立」與「事件廣播」）
 *
 * goal 02 §10：「自動串接折讓單，不需後台二次操作」→ refund 流程在 payment 端
 * 觸發後，由 apps 端訂閱 `order.refunded` 並呼叫 `issueAllowance()`。
 */

import type {
  AllowanceResult,
  InvoiceProvider,
  InvoiceResult,
  IssueAllowanceParams,
  IssueInvoiceParams,
  VoidInvoiceParams,
} from './types.js';
import type { DomainEvent } from '@saas-factory/events';

/** 事件 emit hook（讓 apps 注入 bus，避免 invoice/core 直接依賴特定實作） */
export type InvoiceEventEmit = (event: DomainEvent) => void | Promise<void>;

export interface InvoiceServiceDeps {
  provider: InvoiceProvider;
  emit?: InvoiceEventEmit;
}

/**
 * 發票服務。
 *
 * 用法：
 *   const svc = new InvoiceService({ provider: new EzpayProvider(...), emit: bus.publish });
 *   await svc.issue({ orderId, tenantId, ... });
 */
export class InvoiceService {
  constructor(private readonly deps: InvoiceServiceDeps) {}

  /** 開立發票（即時 / 觸發 / 預約三模式由 caller 決定何時呼叫，本方法只負責「現在開」）。 */
  async issue(params: IssueInvoiceParams): Promise<InvoiceResult> {
    const result = await this.deps.provider.issue(params);
    if (result.status === 'issued') {
      await this.emit({
        type: 'invoice.issued',
        payload: {
          invoiceId: result.invoiceId,
          invoiceNumber: result.invoiceNumber,
          orderId: params.orderId,
          tenantId: params.tenantId,
          totalAmount: result.totalAmount,
        },
      });
    }
    return result;
  }

  /** 開立折讓單（退款時自動串接，goal 02 §10）。 */
  async issueAllowance(
    params: IssueAllowanceParams,
  ): Promise<AllowanceResult> {
    const result = await this.deps.provider.issueAllowance(params);
    if (result.status === 'issued') {
      await this.emit({
        type: 'invoice.allowance-created',
        payload: {
          allowanceId: result.allowanceId,
          invoiceId: params.invoiceId,
          tenantId: params.tenantId,
          amount: result.amount,
          reason: params.reason,
        },
      });
    }
    return result;
  }

  /** 作廢發票（同月內可作廢；跨月需走折讓單）。 */
  async void(params: VoidInvoiceParams): Promise<void> {
    await this.deps.provider.void(params);
    await this.emit({
      type: 'invoice.voided',
      payload: {
        invoiceId: params.invoiceId,
        tenantId: params.tenantId,
        reason: params.reason,
      },
    });
  }

  /** 查詢發票（透傳到 provider）。 */
  async query(invoiceNumber: string): Promise<InvoiceResult | null> {
    return this.deps.provider.query(invoiceNumber);
  }

  private async emit(event: DomainEvent): Promise<void> {
    if (this.deps.emit) {
      await this.deps.emit(event);
    }
  }
}
