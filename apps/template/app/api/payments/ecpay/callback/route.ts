/**
 * 綠界 ECPay 付款結果通知 handler（goal-14 scaffolding）。
 *
 * 流程與藍新對稱：
 *   1. parseWebhook 驗 CheckMacValue + 解析 form body
 *   2. 驗簽失敗 → audit-log + Sentry + 回 ECPay 文字 `0|InvalidSignature`
 *   3. 用 (provider='ecpay', providerTxnId) 去重
 *   4. 沒收過 → 建 Payment + 改 Order；succeeded 才把 Order.status='paid'
 *   5. ECPay 規定要 reply 純文字 `1|OK`，否則它會無限重送
 *
 * 沒設 ECPAY_* env → 503 fail-closed。
 */
import { AuditLogsCollection as _AuditLogsCollection } from '@saas-factory/audit-log';
import { PayloadAuditRecorder } from '@saas-factory/audit-log';
import { EcpayProvider } from '@saas-factory/payment-ecpay';
import * as Sentry from '@sentry/nextjs';
import { getPayload } from 'payload';

import config from '@/payload.config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

void _AuditLogsCollection;

function ecpayFromEnv(): EcpayProvider | null {
  const merchantId = process.env.ECPAY_MERCHANT_ID;
  const hashKey = process.env.ECPAY_HASH_KEY;
  const hashIv = process.env.ECPAY_HASH_IV;
  const env = process.env.ECPAY_ENV === 'production' ? 'production' : 'sandbox';
  if (!merchantId || !hashKey || !hashIv) return null;
  return new EcpayProvider({ merchantId, hashKey, hashIv, env });
}

export async function POST(req: Request): Promise<Response> {
  const provider = ecpayFromEnv();
  if (!provider) {
    return new Response('0|EcpayNotConfigured', { status: 503 });
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
    const reason = event.error ?? 'unknown';
    console.warn('[ecpay/callback] invalid signature:', reason);
    Sentry.captureMessage(`[ecpay] invalid signature: ${reason}`, 'warning');
    await auditor
      .record({
        userId: null,
        tenantId: null,
        action: 'payment.webhook.invalid-signature',
        resourceType: 'Payment',
        resourceId: event.providerTradeId || 'unknown',
        metadata: {
          provider: 'ecpay',
          reason,
          rawBodyLength: rawBody.length,
          rawBodyPreview: rawBody.slice(0, 200),
        },
        ip: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
        userAgent: req.headers.get('user-agent') ?? undefined,
      })
      .catch((err: unknown) => {
        console.warn(
          '[ecpay/callback] audit-log 寫入失敗（不阻擋 reply）：',
          err instanceof Error ? err.message : String(err),
        );
      });
    // ECPay 規定純文字回應；雖然驗簽失敗，我們回 0|... 但 status 200
    return new Response('0|InvalidSignature');
  }

  // 去重
  const existing = await payload.find({
    collection: 'payments',
    where: {
      and: [
        { provider: { equals: 'ecpay' } },
        { providerTxnId: { equals: event.providerTradeId } },
      ],
    },
    limit: 1,
  });
  if (existing.docs.length > 0) {
    return new Response('1|OK');
  }

  if (!event.orderId) {
    return new Response('0|MissingOrderId');
  }
  const orderRes = await payload.find({
    collection: 'orders',
    where: { orderNumber: { equals: event.orderId } },
    limit: 1,
  });
  const order = orderRes.docs[0];
  if (!order) {
    console.warn(
      `[ecpay/callback] order not found: ${event.orderId} (txn=${event.providerTradeId})`,
    );
    return new Response('0|OrderNotFound');
  }

  const succeeded = event.type === 'charge.paid';
  const cancelled = event.type === 'charge.cancelled';
  await payload.create({
    collection: 'payments',
    data: {
      order: order.id,
      tenantId: (order as { tenantId: string }).tenantId,
      provider: 'ecpay',
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
        paymentProvider: 'ecpay',
      },
      overrideAccess: true,
    });
  }

  // ECPay 規定回 `1|OK` 純文字才會停止重送
  return new Response('1|OK');
}
