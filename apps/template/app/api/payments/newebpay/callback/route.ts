/**
 * 藍新 NotifyURL callback handler（goal-14 scaffolding）。
 *
 * 藍新付款完成後會 form-urlencoded POST TradeInfo / TradeSha 過來；
 * 流程：
 *   1. 解析 + 驗 TradeSha + 解密 TradeInfo（provider.parseWebhook）
 *   2. 用 (provider='newebpay', providerTxnId) 去重 — 已收過直接 200（idempotent）
 *   3. 沒收過 → 建 Payment 記錄、更新 Order.status / paymentTxnId
 *   4. 永遠回 200（驗證失敗也回 200 + log，否則藍新無限重送）
 *
 * 沒設 NEWEBPAY_* env → 503 fail-closed（明示「金流未啟用」）。
 *
 * TODO（下個 milestone）：
 * - 接 audit-log 套件（@saas-factory/core-audit-log）
 * - Sentry 告警驗簽失敗
 * - 用 payload.db.transaction 確保 Order/Payment 雙寫原子性
 * - 訂閱事件（subscription.charged / failed / cancelled）
 */
import { NewebPayProvider } from '@saas-factory/payment-newebpay';
import { getPayload } from 'payload';

import config from '@/payload.config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function newebpayFromEnv(): NewebPayProvider | null {
  const merchantId = process.env.NEWEBPAY_MERCHANT_ID;
  const hashKey = process.env.NEWEBPAY_HASH_KEY;
  const hashIv = process.env.NEWEBPAY_HASH_IV;
  const env = process.env.NEWEBPAY_ENV === 'production' ? 'production' : 'sandbox';
  if (!merchantId || !hashKey || !hashIv) return null;
  return new NewebPayProvider({ merchantId, hashKey, hashIv, env });
}

export async function POST(req: Request): Promise<Response> {
  const provider = newebpayFromEnv();
  if (!provider) {
    return Response.json(
      { error: '藍新尚未設定（NEWEBPAY_MERCHANT_ID / HASH_KEY / HASH_IV 未注入）' },
      { status: 503 },
    );
  }

  const rawBody = await req.text();
  const headers: Record<string, string> = {};
  req.headers.forEach((v, k) => {
    headers[k] = v;
  });

  const event = await provider.parseWebhook(rawBody, headers);

  if (!event.signatureValid) {
    // 驗簽失敗 → 紀錄但回 200（避免無限重送）；正式版接 audit-log + Sentry 告警
    console.warn('[newebpay/callback] invalid signature:', event.error ?? '?');
    return Response.json({ ok: false, reason: 'invalid-signature' });
  }

  const payload = await getPayload({ config });

  // 去重：用 idempotencyKey 查 Payments
  const existing = await payload.find({
    collection: 'payments',
    where: {
      and: [
        { provider: { equals: 'newebpay' } },
        { providerTxnId: { equals: event.providerTradeId } },
      ],
    },
    limit: 1,
  });
  if (existing.docs.length > 0) {
    return Response.json({ ok: true, dedup: true, paymentId: existing.docs[0]!.id });
  }

  // 找對應 Order（藍新 MerchantOrderNo 對應我們的 orderNumber）
  if (!event.orderId) {
    return Response.json({ ok: false, reason: 'missing-orderId' });
  }
  const orderRes = await payload.find({
    collection: 'orders',
    where: { orderNumber: { equals: event.orderId } },
    limit: 1,
  });
  const order = orderRes.docs[0];
  if (!order) {
    console.warn(
      `[newebpay/callback] order not found: ${event.orderId} (txn=${event.providerTradeId})`,
    );
    return Response.json({ ok: false, reason: 'order-not-found' });
  }

  const succeeded = event.type === 'charge.paid';
  const cancelled = event.type === 'charge.cancelled';
  const newPayment = await payload.create({
    collection: 'payments',
    data: {
      order: order.id,
      tenantId: (order as { tenantId: string }).tenantId,
      provider: 'newebpay',
      // method 從 raw payload 撈；scaffolding 階段先寫 credit
      method: 'credit',
      providerTxnId: event.providerTradeId,
      status: succeeded ? 'succeeded' : cancelled ? 'cancelled' : 'failed',
      amount: event.amount?.amount ?? 0,
      currency: event.amount?.currency ?? 'TWD',
      rawPayload: event.raw,
      failureMessage: succeeded ? undefined : event.error,
    },
    overrideAccess: true,
  });

  if (succeeded) {
    await payload.update({
      collection: 'orders',
      id: order.id,
      data: {
        status: 'paid',
        paymentTxnId: event.providerTradeId,
        paymentProvider: 'newebpay',
      },
      overrideAccess: true,
    });
  }

  return Response.json({ ok: true, paymentId: newPayment.id });
}
