/**
 * 藍新 NotifyURL callback handler（goal-14 scaffolding）。
 *
 * 藍新付款完成後會 form-urlencoded POST TradeInfo / TradeSha 過來；
 * 流程：
 *   1. 解析 + 驗 TradeSha + 解密 TradeInfo（provider.parseWebhook）
 *   2. 驗簽失敗 → 寫 audit-log（payment.webhook.invalid-signature）+ Sentry 告警 + 回 200
 *   3. 用 (provider='newebpay', providerTxnId) 去重 — 已收過直接 200（idempotent）
 *   4. 沒收過 → 建 Payment 記錄、更新 Order.status / paymentTxnId
 *   5. 永遠回 200（驗證失敗也回 200 + audit，否則藍新無限重送）
 *
 * 沒設 NEWEBPAY_* env → 503 fail-closed（明示「金流未啟用」）。
 *
 * TODO（下個 milestone）：
 * - 用 payload.db.transaction 確保 Order/Payment 雙寫原子性
 * - 訂閱事件（subscription.charged / failed / cancelled）
 */
import { PayloadAuditRecorder } from '@saas-factory/audit-log';
import { NewebPayProvider } from '@saas-factory/payment-newebpay';
import * as Sentry from '@sentry/nextjs';
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

  const payload = await getPayload({ config });
  const auditor = new PayloadAuditRecorder(payload);

  if (!event.signatureValid) {
    // 驗簽失敗：寫 audit-log + Sentry 告警 + 回 200（避免藍新無限重送）。
    // 攻擊者投毒 / 配置錯誤都會打到這條；audit 留下完整 raw body 給後續鑑識。
    const reason = event.error ?? 'unknown';
    console.warn('[newebpay/callback] invalid signature:', reason);
    Sentry.captureMessage(
      `[newebpay] invalid signature: ${reason}`,
      'warning',
    );
    await auditor
      .record({
        userId: null,
        tenantId: null,
        action: 'payment.webhook.invalid-signature',
        resourceType: 'Payment',
        resourceId: event.providerTradeId || 'unknown',
        metadata: {
          provider: 'newebpay',
          reason,
          // 不存 rawBody 全文（可能含敏感資訊）；只存長度 + 前 200 字
          rawBodyLength: rawBody.length,
          rawBodyPreview: rawBody.slice(0, 200),
        },
        ip: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
        userAgent: req.headers.get('user-agent') ?? undefined,
      })
      .catch((err: unknown) => {
        console.warn(
          '[newebpay/callback] audit-log 寫入失敗（不阻擋回 200）：',
          err instanceof Error ? err.message : String(err),
        );
      });
    return Response.json({ ok: false, reason: 'invalid-signature' });
  }

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
