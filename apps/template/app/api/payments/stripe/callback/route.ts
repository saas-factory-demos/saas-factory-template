/**
 * Stripe Webhook handler（goal-14 scaffolding）。
 *
 * Stripe webhook 與藍新 / 綠界差別：
 * - 簽章驗證：Stripe-Signature header（HMAC-SHA256 with timestamp）
 * - body 是 JSON（不是 form-urlencoded）
 * - reply：200 即可（不需特殊文字）
 *
 * 沒設 STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET → 503 fail-closed。
 */
import { PayloadAuditRecorder } from '@saas-factory/audit-log';
import { StripeProvider } from '@saas-factory/payment-stripe';
import * as Sentry from '@sentry/nextjs';
import { getPayload } from 'payload';

import config from '@/payload.config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function stripeFromEnv(): StripeProvider | null {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secretKey || !webhookSecret) return null;
  return new StripeProvider({ secretKey, webhookSecret });
}

export async function POST(req: Request): Promise<Response> {
  const provider = stripeFromEnv();
  if (!provider) {
    return Response.json(
      { error: 'Stripe 尚未設定（STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET 未注入）' },
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
    const reason = event.error ?? 'unknown';
    console.warn('[stripe/callback] invalid signature:', reason);
    Sentry.captureMessage(`[stripe] invalid signature: ${reason}`, 'warning');
    await auditor
      .record({
        userId: null,
        tenantId: null,
        action: 'payment.webhook.invalid-signature',
        resourceType: 'Payment',
        resourceId: event.providerTradeId || 'unknown',
        metadata: {
          provider: 'stripe',
          reason,
          rawBodyLength: rawBody.length,
          rawBodyPreview: rawBody.slice(0, 200),
        },
        ip: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
        userAgent: req.headers.get('user-agent') ?? undefined,
      })
      .catch((err: unknown) => {
        console.warn(
          '[stripe/callback] audit-log 寫入失敗：',
          err instanceof Error ? err.message : String(err),
        );
      });
    // Stripe 期待 4xx 才會重試；驗簽失敗回 400 讓 Stripe 知道
    return Response.json({ error: 'invalid signature' }, { status: 400 });
  }

  const existing = await payload.find({
    collection: 'payments',
    where: {
      and: [
        { provider: { equals: 'stripe' } },
        { providerTxnId: { equals: event.providerTradeId } },
      ],
    },
    limit: 1,
  });
  if (existing.docs.length > 0) {
    return Response.json({ ok: true, dedup: true });
  }

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
    return Response.json({ ok: false, reason: 'order-not-found' });
  }

  const succeeded = event.type === 'charge.paid';
  const cancelled = event.type === 'charge.cancelled';
  await payload.create({
    collection: 'payments',
    data: {
      order: order.id,
      tenantId: (order as { tenantId: string }).tenantId,
      provider: 'stripe',
      // Stripe 主要走 stripe-card；其他 method 之後做
      method: 'stripe-card',
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
        paymentProvider: 'stripe',
      },
      overrideAccess: true,
    });
  }

  return Response.json({ ok: true });
}
