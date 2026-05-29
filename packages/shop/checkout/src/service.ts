/**
 * 結帳協調器。
 */

import { DiscountEngine } from '@saas-factory/shop-discount-engine';
import { OrderService } from '@saas-factory/shop-orders';

import type {
  CheckoutDeps,
  CheckoutInput,
  CheckoutQuote,
  CheckoutResult,
} from './types.js';
import type { DomainEvent } from '@saas-factory/events';
import type { DiscountContext } from '@saas-factory/shop-discount-engine';
import type { Order, OrderItem } from '@saas-factory/shop-orders';


export interface CheckoutServiceConfig {
  emit?: (event: DomainEvent) => void;
  currency?: string;
  now?: () => Date;
}

/**
 * 結帳服務：一頁式整合 cart / inventory / discount / shipping / tax / payment / order。
 *
 * 設計原則：
 * - quote()：純試算，不寫資料庫、不預扣庫存。
 * - submit()：預扣庫存 → 建立訂單 → 啟動金流 → emit order.created。
 */
export class CheckoutService {
  private readonly engine = new DiscountEngine();
  private readonly orders: OrderService;

  constructor(
    private readonly deps: CheckoutDeps,
    private readonly config: CheckoutServiceConfig = {},
  ) {
    this.orders = new OrderService({
      emit: config.emit,
      now: config.now,
    });
  }

  /**
   * 試算（給結帳頁右側即時顯示）。不寫入任何狀態。
   */
  async quote(input: CheckoutInput): Promise<CheckoutQuote> {
    const computed = await this.computeTotals(input);
    return computed.quote;
  }

  /**
   * 送出結帳：預扣庫存 → 建立訂單 → 啟動金流。
   *
   * 任一步失敗即拋例外，由上層處理回滾。
   */
  async submit(input: CheckoutInput): Promise<CheckoutResult> {
    if (!input.agreedToTerms) {
      throw new Error('未同意條款');
    }
    const { quote, items } = await this.computeTotals(input);
    const orderId = this.deps.orderId();

    const reservation = await this.deps.inventory.reserve({
      tenantId: input.tenantId,
      items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
      orderId,
    });
    if (!reservation.ok) {
      throw new Error(`庫存不足：${reservation.failedVariantIds?.join(', ') ?? ''}`);
    }

    const orderNumber = await this.deps.orderNumber.next(input.tenantId);
    const currency = this.config.currency ?? 'TWD';

    const draft: Order = this.orders.draft({
      id: orderId,
      tenantId: input.tenantId,
      orderNumber,
      userId: input.userId,
      guestEmail: input.userId ? undefined : input.recipient.email,
      guestPhone: input.userId ? undefined : input.recipient.phone,
      items,
      currency,
      subtotal: quote.subtotal,
      discountTotal: quote.discountTotal,
      shippingFee: quote.shippingFee,
      taxAmount: quote.taxAmount,
      total: quote.total,
      marketingOptIn: input.marketingOptIn,
      note: input.note,
      isPreOrder: false,
      paymentProvider: input.payment.provider,
      shippingProvider: input.shipping.methodId,
    });

    const submitted = this.orders.submit(draft);

    // 先持久化訂單再啟動金流，避免「金流已扣款但訂單沒寫入 DB」造成的對帳孤兒。
    if (this.deps.persistOrder) {
      try {
        await this.deps.persistOrder(submitted);
      } catch (persistError) {
        await this.tryReleaseReservations(submitted);
        throw persistError;
      }
    }

    try {
      const paymentResult = await this.deps.payment.initiate({
        orderId: submitted.id,
        tenantId: submitted.tenantId,
        provider: input.payment.provider,
        methodId: input.payment.methodId,
        amount: submitted.total,
        currency,
        installments: input.payment.installments,
      });
      return {
        order: submitted,
        paymentRedirect: paymentResult.redirectUrl,
        paymentPayload: paymentResult.payload,
      };
    } catch (paymentError) {
      // 金流啟動失敗：先呼叫使用者注入的 rollback（標記訂單 cancelled 等），再釋放庫存。
      try {
        await this.deps.rollbackOrder?.({ order: submitted, reason: paymentError });
      } finally {
        await this.tryReleaseReservations(submitted);
      }
      throw paymentError;
    }
  }

  /**
   * 嘗試釋放預扣庫存。失敗時不再丟例外（避免遮蔽原本的 payment error）。
   */
  private async tryReleaseReservations(order: Order): Promise<void> {
    if (!this.deps.inventory.release) return;
    try {
      await this.deps.inventory.release({ tenantId: order.tenantId, orderId: order.id });
    } catch (releaseError) {
      this.config.emit?.({
        type: 'checkout.inventory-release-failed',
        payload: {
          tenantId: order.tenantId,
          orderId: order.id,
          reason: releaseError instanceof Error ? releaseError.message : String(releaseError),
        },
      });
    }
  }

  private async computeTotals(input: CheckoutInput): Promise<{
    quote: CheckoutQuote;
    items: OrderItem[];
  }> {
    const cart = await this.deps.cart.load(input.cartId);
    if (!cart || cart.items.length === 0) {
      throw new Error('購物車為空');
    }

    const subtotal = cart.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

    const rulesResult = await this.deps.getRules({
      tenantId: input.tenantId,
      couponCode: input.couponCode,
      userId: input.userId,
    });
    const rules = Array.isArray(rulesResult) ? rulesResult : rulesResult.rules;
    const customerUsageCounts = Array.isArray(rulesResult)
      ? undefined
      : rulesResult.customerUsageCounts;

    const discountContext: DiscountContext = {
      items: cart.items.map((i) => ({
        variantId: i.variantId,
        productId: i.productId,
        categoryIds: i.categoryIds,
        unitPrice: i.unitPrice,
        quantity: i.quantity,
      })),
      subtotal,
      customerTags: input.customer?.customerTags,
      memberTier: input.customer?.memberTier,
      isFirstPurchase: input.customer?.isFirstPurchase,
      birthdayMonth: input.customer?.birthdayMonth,
      customerUsageCounts,
      siteType: input.siteType,
      now: this.config.now?.(),
    };

    const discounts = this.engine.apply(rules, discountContext);
    const rawDiscountTotal = discounts.reduce((sum, d) => sum + d.amount, 0);
    /**
     * 折扣總額不得超過 subtotal，避免堆疊折扣讓客戶反而拿錢回去（負金額會炸 newebpay / ecpay）。
     * 同時保留 discounts 原始結果作為帳務 audit；只在彙整時 clamp。
     */
    const discountTotal = Math.min(rawDiscountTotal, subtotal);
    const shippingDiscount = discounts.reduce((sum, d) => sum + (d.shippingDiscount ?? 0), 0);
    const grossShipping = await this.deps.shipping.calculate({
      tenantId: input.tenantId,
      methodId: input.shipping.methodId,
      subtotal,
    });
    const shippingFee = Math.max(0, grossShipping - shippingDiscount);
    const taxableBase = Math.max(0, subtotal - discountTotal);
    const taxAmount = await this.deps.tax.calculate({ subtotal: taxableBase });
    const total = taxableBase + shippingFee + taxAmount;

    const items: OrderItem[] = cart.items.map((i) => ({
      productId: i.productId,
      variantId: i.variantId,
      sku: i.sku,
      title: i.title,
      unitPrice: i.unitPrice,
      quantity: i.quantity,
      optionValues: i.optionValues,
      thumbnailUrl: i.thumbnailUrl,
    }));

    allocateDiscountsToItems(items, discounts);

    return {
      items,
      quote: {
        items,
        subtotal,
        discounts,
        discountTotal,
        shippingFee,
        shippingDiscount,
        taxAmount,
        total,
      },
    };
  }
}

/**
 * 將折扣依比例分攤回各 OrderItem（避免退貨時不知折扣怎麼分）。
 */
function allocateDiscountsToItems(
  items: OrderItem[],
  discounts: Array<{ amount: number; allocatedItemIndexes?: number[] }>,
): void {
  for (const d of discounts) {
    if (d.amount <= 0) continue;
    const indexes = d.allocatedItemIndexes ?? items.map((_, idx) => idx);
    const targetItems = indexes.map((idx) => items[idx]).filter((i): i is OrderItem => !!i);
    const base = targetItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
    if (base <= 0) continue;
    for (const item of targetItems) {
      const share = Math.floor((item.unitPrice * item.quantity * d.amount) / base);
      item.allocatedDiscount = (item.allocatedDiscount ?? 0) + share;
    }
  }
}
