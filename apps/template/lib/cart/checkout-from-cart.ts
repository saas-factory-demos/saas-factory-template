/**
 * Checkout from Cart（Phase 9 多商品擴充）。
 *
 * 結帳邏輯核心 lib：把 cart 轉成 Order，套用 discount，呼 payment provider。
 *
 * 流程：
 * 1. 讀 cart by cartId
 * 2. 拉所有 cart line 對應的 products（含 variants）
 * 3. 拆解 bundle line（productType=bundle → 拆成多筆 Order item）
 * 4. 跑 DiscountEngine + Q3=C applicator
 * 5. 建 Order（status='pending-payment'）+ items snapshot
 * 6. 呼 NewebPay / ECPay / Stripe charge → 回 redirectUrl
 * 7. cart status → 'converted'
 *
 * 注意：本 lib 不直接做 reserveVariant；cart line 加入時已 reserve 過了（limited 商品）
 * 或 normal 商品依 inventoryStrategy 在這裡 reserve；commit 走 payment callback。
 */
import { generateOrderNumber } from '@saas-factory/shop-orders';

import { applyCartDiscountsQ3C } from './discount-applicator.js';
import { reserveVariant } from './inventory-reserver.js';

import type {
  AppliedDiscountWithCategory,
} from './discount-applicator.js';
import type { DiscountContext } from '@saas-factory/shop-discount-engine';
import type { Payload } from 'payload';

interface CartDoc {
  id: number | string;
  cartId: string;
  tenantId: string;
  user?: number | string | null;
  guestEmail?: string;
  items?: CartLine[];
  couponCode?: string;
  currency?: string;
}

interface CartLine {
  product: number | string | { id: number | string };
  variantSku: string;
  quantity: number;
  optionValuesSnapshot?: Record<string, string>;
  unitPriceSnapshot: number;
  titleSnapshot?: string;
}

interface ProductDoc {
  id: number | string;
  title?: string;
  productType?: 'simple' | 'bundle';
  inventoryStrategy?: 'normal' | 'limited';
  variants?: Array<{ sku: string; unitPrice: number; stock?: number; reservedStock?: number }>;
  bundleItems?: Array<{
    product: number | string | { id: number | string };
    variantSku: string;
    quantity: number;
  }>;
  categories?: Array<{ id: number | string } | number | string>;
  unitPrice?: number;
}

export interface CheckoutFromCartInput {
  cartId: string;
  recipient: { name: string; phone: string; email: string; address?: string };
  marketingOptIn?: boolean;
  /** 後續可選 'newebpay' | 'ecpay' | 'stripe'；scaffolding 階段只接 newebpay */
  provider?: 'newebpay';
}

export interface CheckoutLineResult {
  /** 從 cart line 轉換的 Order items；bundle 已拆解 */
  orderItems: Array<{
    productId: number | string;
    variantSku: string;
    quantity: number;
    unitPrice: number;
    title: string;
    isBundleChild?: boolean;
    parentBundleLineIdx?: number;
  }>;
  appliedDiscounts: AppliedDiscountWithCategory[];
  subtotal: number;
  discountTotal: number;
  total: number;
}

/**
 * 把 cart line 轉成 Order item，bundle 自動拆解。
 */
export async function expandCartToOrderItems(
  payload: Payload,
  cart: CartDoc,
): Promise<CheckoutLineResult['orderItems']> {
  const items: CheckoutLineResult['orderItems'] = [];
  let parentIdx = 0;
  for (const line of cart.items ?? []) {
    const productId = typeof line.product === 'object' ? line.product.id : line.product;
    const product = (await payload.findByID({
      collection: 'products',
      id: productId,
      disableErrors: true,
    })) as unknown as ProductDoc | null;
    if (!product) continue;

    if (product.productType === 'bundle' && product.bundleItems && product.bundleItems.length > 0) {
      // bundle line 本身也存（給後台看「組合商品 x N」）
      items.push({
        productId,
        variantSku: line.variantSku,
        quantity: line.quantity,
        unitPrice: line.unitPriceSnapshot,
        title: line.titleSnapshot ?? product.title ?? '組合商品',
      });
      const thisParentIdx = parentIdx;
      // 拆解：每個 bundleItem × cart line quantity
      for (const bi of product.bundleItems) {
        const childProductId = typeof bi.product === 'object' ? bi.product.id : bi.product;
        const childProduct = (await payload.findByID({
          collection: 'products',
          id: childProductId,
          disableErrors: true,
        })) as unknown as ProductDoc | null;
        if (!childProduct) continue;
        const childVariant = childProduct.variants?.find((v) => v.sku === bi.variantSku);
        const childPrice = childVariant?.unitPrice ?? childProduct.unitPrice ?? 0;
        items.push({
          productId: childProductId,
          variantSku: bi.variantSku,
          quantity: bi.quantity * line.quantity,
          unitPrice: childPrice,
          title: childProduct.title ?? 'child',
          isBundleChild: true,
          parentBundleLineIdx: thisParentIdx,
        });
      }
    } else {
      items.push({
        productId,
        variantSku: line.variantSku,
        quantity: line.quantity,
        unitPrice: line.unitPriceSnapshot,
        title: line.titleSnapshot ?? product.title ?? '商品',
      });
    }
    parentIdx = items.length;
  }
  return items;
}

/**
 * Cart → Order quote（含 discount 計算，未真的建 Order）。
 *
 * 用途：結帳前讓 user 看到「折扣 X、總計 Y」；按下「前往付款」才呼 commitCheckout。
 *
 * Phase 12：擴充 persist 參數，true 時把 appliedDiscounts snapshot 寫回 cart，
 * 讓 GET /api/cart 也能直接讀到當前折扣（不需 client 每次重算）。
 */
export async function quoteCheckoutFromCart(
  payload: Payload,
  cart: CartDoc,
  options: { persistSnapshot?: boolean } = {},
): Promise<CheckoutLineResult> {
  const orderItems = await expandCartToOrderItems(payload, cart);
  // 排除 bundle parent line 不重複算（child lines 是真實價格）
  const billable = orderItems.filter((it) => !it.parentBundleLineIdx);
  const subtotal = billable.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0);

  // 跑 discount applicator
  const rulesRes = await payload.find({
    collection: 'discount-rules',
    where: { active: { equals: true } },
    limit: 200,
  });
  const ctx: DiscountContext = {
    items: orderItems.map((it) => ({
      variantId: it.variantSku,
      productId: String(it.productId),
      unitPrice: it.unitPrice,
      quantity: it.quantity,
    })),
    subtotal,
  };
  const discountResult = applyCartDiscountsQ3C({
    rules: rulesRes.docs as unknown as Array<Record<string, unknown>>,
    context: ctx,
    couponCode: cart.couponCode,
  });
  const total = Math.max(0, subtotal - discountResult.totalDiscount);

  // Phase 12：把折扣 snapshot 寫回 cart，下次 GET /api/cart 直接看到
  if (options.persistSnapshot && cart.id) {
    const now = new Date().toISOString();
    const appliedDiscountsForCart = discountResult.applied.map((d) => ({
      ruleId: d.ruleId,
      ruleTitle: d.ruleName,
      category: d.category,
      discountAmount: d.amount,
      appliedAt: now,
    }));
    await payload
      .update({
        collection: 'carts',
        id: cart.id,
        data: {
          appliedDiscounts: appliedDiscountsForCart,
          discountTotal: discountResult.totalDiscount,
          estimatedTotal: total,
        } as unknown as Record<string, unknown> as never,
        overrideAccess: true,
      })
      .catch((err) => {
        console.warn(
          '[quoteCheckoutFromCart] persist snapshot failed:',
          err instanceof Error ? err.message : String(err),
        );
      });
  }

  return {
    orderItems,
    appliedDiscounts: discountResult.applied,
    subtotal,
    discountTotal: discountResult.totalDiscount,
    total,
  };
}

/**
 * Commit checkout：建 Order + reserve inventory + 回 ready-for-payment 狀態。
 *
 * 不直接呼 payment provider（給 API route 自己決定哪家）；本 fn 只負責 DB 操作。
 */
export async function commitCheckout(
  payload: Payload,
  cart: CartDoc,
  input: CheckoutFromCartInput,
): Promise<{
  orderId: number | string;
  orderNumber: string;
  total: number;
  currency: string;
  items: CheckoutLineResult['orderItems'];
}> {
  const quote = await quoteCheckoutFromCart(payload, cart);

  // normal 商品在這 reserve（limited 已在加車時 reserve）
  for (const it of quote.orderItems) {
    if (it.parentBundleLineIdx !== undefined) {
      // bundle child：always reserve（無論策略，下單時就要鎖）
      await reserveVariant(payload, {
        productId: it.productId,
        variantSku: it.variantSku,
        quantity: it.quantity,
      }).catch(() => undefined);
    } else {
      const p = (await payload.findByID({
        collection: 'products',
        id: it.productId,
        disableErrors: true,
      })) as unknown as ProductDoc | null;
      if (p?.inventoryStrategy === 'normal') {
        await reserveVariant(payload, {
          productId: it.productId,
          variantSku: it.variantSku,
          quantity: it.quantity,
        }).catch(() => undefined);
      }
    }
  }

  // 建 Order
  const dailySeq = Math.floor(Date.now() / 1000) % 100000;
  const orderNumber = generateOrderNumber(dailySeq);
  const created = await payload.create({
    collection: 'orders',
    data: {
      orderNumber,
      tenantId: cart.tenantId,
      user: typeof cart.user === 'number' ? cart.user : undefined,
      guestEmail: input.recipient.email,
      guestPhone: input.recipient.phone,
      status: 'pending-payment',
      items: quote.orderItems.map((it) => ({
        productId: String(it.productId),
        sku: it.variantSku,
        title: it.title,
        unitPrice: it.unitPrice,
        quantity: it.quantity,
        isBundleChild: it.isBundleChild,
      })) as unknown as { value: unknown },
      currency: (cart.currency ?? 'TWD') as 'TWD',
      subtotal: quote.subtotal,
      discountTotal: quote.discountTotal,
      shippingFee: 0,
      taxAmount: 0,
      total: quote.total,
      paymentMethod: 'credit',
      paymentProvider: input.provider ?? 'newebpay',
      marketingOptIn: Boolean(input.marketingOptIn),
      shippingAddress: input.recipient.address
        ? {
            name: input.recipient.name,
            phone: input.recipient.phone,
            address: input.recipient.address,
          }
        : undefined,
    },
    overrideAccess: true,
  });

  // cart status → converted
  await payload.update({
    collection: 'carts',
    id: cart.id,
    data: { status: 'converted' } as unknown as Record<string, unknown> as never,
    overrideAccess: true,
  });

  return {
    orderId: created.id,
    orderNumber,
    total: quote.total,
    currency: (cart.currency ?? 'TWD'),
    items: quote.orderItems,
  };
}
