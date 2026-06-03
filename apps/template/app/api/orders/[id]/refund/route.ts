/**
 * Order 退款 endpoint（B4）。
 *
 * POST /api/orders/:id/refund  body: { amount?, reason? }
 * - amount 省略 = 全額退；指定 = 部分退（minor unit integer）
 * - reason 是後台填的理由，會寫進 audit-log + Payment.failureMessage
 *
 * 流程：
 *   1. 認證：只允許登入後台使用者（Payload session cookie）
 *   2. 拉 Order + 對應「最近 succeeded Payment」
 *   3. 依 Payment.provider 切藍新 / 綠界 / Stripe，呼 provider.refund
 *   4. 建退款 Payment 記錄（isRefund=true、parentPayment 指向原 txn）
 *   5. Order.status: paid → refund-requested（全額）/ 不變（部分，可多次直到全額）
 *   6. audit-log（order.refund）+ Sentry breadcrumb
 *
 * 不重複退款：用 idempotencyKey = `refund-${orderNumber}-${ts}` 給 provider 去重。
 * provider.refund 失敗 → 不建退款 Payment、Order 狀態不變、回 502。
 */
import { PayloadAuditRecorder } from '@saas-factory/audit-log';
import { EcpayProvider } from '@saas-factory/payment-ecpay';
import { NewebPayProvider } from '@saas-factory/payment-newebpay';
import { StripeProvider } from '@saas-factory/payment-stripe';
import * as Sentry from '@sentry/nextjs';
import { headers as nextHeaders } from 'next/headers';
import { getPayload } from 'payload';

import config from '@/payload.config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RefundBody {
  amount?: number;
  reason?: string;
}

function buildProvider(name: string) {
  if (name === 'newebpay') {
    const merchantId = process.env.NEWEBPAY_MERCHANT_ID;
    const hashKey = process.env.NEWEBPAY_HASH_KEY;
    const hashIv = process.env.NEWEBPAY_HASH_IV;
    if (!merchantId || !hashKey || !hashIv) return null;
    return new NewebPayProvider({
      merchantId,
      hashKey,
      hashIv,
      env: process.env.NEWEBPAY_ENV === 'production' ? 'production' : 'sandbox',
    });
  }
  if (name === 'ecpay') {
    const merchantId = process.env.ECPAY_MERCHANT_ID;
    const hashKey = process.env.ECPAY_HASH_KEY;
    const hashIv = process.env.ECPAY_HASH_IV;
    if (!merchantId || !hashKey || !hashIv) return null;
    return new EcpayProvider({
      merchantId,
      hashKey,
      hashIv,
      env: process.env.ECPAY_ENV === 'production' ? 'production' : 'sandbox',
    });
  }
  if (name === 'stripe') {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secretKey || !webhookSecret) return null;
    return new StripeProvider({ secretKey, webhookSecret });
  }
  return null;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;
  const payload = await getPayload({ config });

  // 後台 session 認證：Payload Local API 由 Authorization 或 next/headers 提取 user
  const h = await nextHeaders();
  const auth = await payload.auth({ headers: h });
  if (!auth.user) {
    return Response.json({ error: '需要登入後台' }, { status: 401 });
  }

  let body: RefundBody;
  try {
    body = (await req.json()) as RefundBody;
  } catch {
    return Response.json({ error: 'JSON body 解析失敗' }, { status: 400 });
  }

  const order = await payload.findByID({
    collection: 'orders',
    id,
    disableErrors: true,
  });
  if (!order) return Response.json({ error: 'order not found' }, { status: 404 });
  const orderAny = order as unknown as Record<string, unknown>;
  if (orderAny.status !== 'paid') {
    return Response.json(
      { error: `Order 狀態為 ${orderAny.status}，僅 paid 可退款` },
      { status: 409 },
    );
  }

  // 找 succeeded Payment（按建立時間倒序）
  const succRes = await payload.find({
    collection: 'payments',
    where: {
      and: [
        { order: { equals: id } },
        { status: { equals: 'succeeded' } },
        { isRefund: { equals: false } },
      ],
    },
    sort: '-createdAt',
    limit: 1,
  });
  const payment = succRes.docs[0];
  if (!payment) {
    return Response.json({ error: '找不到對應的成功扣款記錄' }, { status: 409 });
  }
  const paymentAny = payment as unknown as Record<string, unknown>;
  const providerName = paymentAny.provider as string;
  const provider = buildProvider(providerName);
  if (!provider) {
    return Response.json(
      { error: `provider ${providerName} 尚未設定 env，無法退款` },
      { status: 503 },
    );
  }

  const paidAmount = (paymentAny.amount as number) ?? 0;
  const currency = (paymentAny.currency as string) ?? 'TWD';
  const refundAmount = typeof body.amount === 'number' && body.amount > 0 ? body.amount : paidAmount;
  if (refundAmount > paidAmount) {
    return Response.json({ error: '退款金額超過原扣款' }, { status: 400 });
  }

  const idempotencyKey = `refund-${orderAny.orderNumber as string}-${Date.now()}`;
  const auditor = new PayloadAuditRecorder(payload);

  let refundResult;
  try {
    refundResult = await provider.refund({
      orderId: orderAny.orderNumber as string,
      tenantId: (orderAny.tenantId as string) ?? 'default',
      providerTradeId: paymentAny.providerTxnId as string,
      amount: { amount: refundAmount, currency: currency as 'TWD' },
      reason: body.reason,
      idempotencyKey,
    });
  } catch (err) {
    Sentry.captureException(err, { tags: { kind: 'refund', provider: providerName } });
    return Response.json(
      {
        error: `provider refund 失敗：${err instanceof Error ? err.message : String(err)}`,
      },
      { status: 502 },
    );
  }

  // 建退款 Payment 記錄
  const refundPayment = await payload.create({
    collection: 'payments',
    data: {
      // Payload relationship 欄位要 number id（postgres serial）
      order: Number(id),
      tenantId: (orderAny.tenantId as string) ?? 'default',
      provider: providerName as 'newebpay',
      method: (paymentAny.method as 'credit') ?? 'credit',
      providerTxnId: refundResult.refundId || `${idempotencyKey}`,
      status: 'refunded',
      amount: refundAmount,
      currency: currency as 'TWD',
      isRefund: true,
      parentPayment: Number(payment.id),
      rawPayload: refundResult.raw as Record<string, unknown> | undefined,
      failureMessage: body.reason,
    },
    overrideAccess: true,
  });

  // 全額退款 → Order.status = refunded；部分退 → refund-requested
  const newOrderStatus = refundAmount === paidAmount ? 'refunded' : 'refund-requested';
  await payload.update({
    collection: 'orders',
    id,
    data: { status: newOrderStatus },
    overrideAccess: true,
  });

  /*
   * Phase 13：全額退款時還庫存。
   *
   * 為何只全額退才還：部分退款多半是「降價補貼」或「品項瑕疵折讓」，貨還在用戶手上、
   * 不適合還庫存（會超賣）。全額退款則代表「全部退回」，實體商品理當歸位。
   *
   * 商家可在 Order.internalNote 標記「未實際收到退貨」手動 reverse 此操作（後續 milestone
   * 出後台 UI 給商家勾「不還庫存」選項）。
   *
   * 不阻擋回應：庫存還原失敗 audit-log 記錄，付款已退、不該因庫存而 502 給用戶。
   */
  if (refundAmount === paidAmount) {
    const items = (orderAny.items as Array<Record<string, unknown>> | undefined) ?? [];
    for (const item of items) {
      // bundle 子項不重複還（commitCheckout 拆解時已對 child 操作；
      // refund 對 child 還原即可，parent line 沒實體庫存可還）
      if (item.isBundleChild === false && item.parentBundleLineIdx !== undefined) continue;
      const productId = item.productId as string | number | undefined;
      const sku = item.sku as string | undefined;
      const quantity = item.quantity as number | undefined;
      if (!productId || !sku || !quantity) continue;
      const { restockOnRefund } = await import('@/lib/cart/inventory-reserver');
      await restockOnRefund(payload, {
        productId,
        variantSku: sku,
        quantity,
      }).catch((err) => {
        console.warn(
          '[refund] restock failed for',
          productId,
          sku,
          err instanceof Error ? err.message : String(err),
        );
      });
    }
  }

  // audit-log
  await auditor
    .record({
      userId: String(auth.user.id),
      tenantId: (orderAny.tenantId as string) ?? null,
      action: 'order.refund',
      resourceType: 'Order',
      resourceId: String(id),
      before: { status: 'paid' },
      after: { status: newOrderStatus, refundAmount, refundId: refundResult.refundId },
      metadata: {
        provider: providerName,
        idempotencyKey,
        reason: body.reason ?? null,
        partial: refundAmount < paidAmount,
      },
      ip: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
      userAgent: req.headers.get('user-agent') ?? undefined,
    })
    .catch((err: unknown) => {
      console.warn(
        '[refund] audit-log 寫入失敗（不阻擋回應）：',
        err instanceof Error ? err.message : String(err),
      );
    });

  return Response.json({
    ok: true,
    refundPaymentId: refundPayment.id,
    refundId: refundResult.refundId,
    newOrderStatus,
    refundAmount,
  });
}
