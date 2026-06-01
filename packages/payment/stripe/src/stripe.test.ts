import { createHmac } from 'node:crypto';

import { describe, expect, it, vi } from 'vitest';

import { StripeProvider, verifyStripeSignature } from './index.js';

import type {
  ChargeRequest,
  RefundRequest,
} from '@saas-factory/payment-core';

const SECRET = 'whsec_test_secret';

function buildStripeSig(body: string, secret: string, ts = Math.floor(Date.now() / 1000)): string {
  const signed = `${ts}.${body}`;
  const v1 = createHmac('sha256', secret).update(signed).digest('hex');
  return `t=${ts},v1=${v1}`;
}

describe('verifyStripeSignature', () => {
  it('合法簽章通過', () => {
    const body = '{"id":"evt_1"}';
    const sig = buildStripeSig(body, SECRET);
    expect(verifyStripeSignature(body, sig, SECRET)).toBe(true);
  });

  it('竄改 body 失敗', () => {
    const sig = buildStripeSig('{"id":"evt_1"}', SECRET);
    expect(verifyStripeSignature('{"id":"evil"}', sig, SECRET)).toBe(false);
  });

  it('簽章超出時間容差失敗', () => {
    const body = '{}';
    const oldTs = Math.floor(Date.now() / 1000) - 1000;
    const sig = buildStripeSig(body, SECRET, oldTs);
    expect(verifyStripeSignature(body, sig, SECRET, 300)).toBe(false);
  });

  it('header 格式錯誤回 false', () => {
    expect(verifyStripeSignature('{}', 'invalid', SECRET)).toBe(false);
  });
});

describe('StripeProvider.charge', () => {
  it('建 checkout session 並回 redirect url', async () => {
    const fakeFetch = vi.fn().mockResolvedValue({
      json: () =>
        Promise.resolve({
          id: 'cs_test_123',
          url: 'https://checkout.stripe.com/c/pay/cs_test_123',
        }),
    });
    const provider = new StripeProvider({
      secretKey: 'sk_test',
      webhookSecret: SECRET,
      fetchImpl: fakeFetch as unknown as typeof fetch,
    });
    const req: ChargeRequest = {
      orderId: 'O-001',
      tenantId: 't1',
      method: 'stripe-card',
      amount: { amount: 9999, currency: 'USD' },
      idempotencyKey: 'O-001',
      returnUrl: 'https://app/done',
      cancelUrl: 'https://app/cancel',
    };
    const result = await provider.charge(req);
    expect(result.status).toBe('pending');
    expect(result.redirectUrl).toContain('checkout.stripe.com');
    expect(result.providerTradeId).toBe('cs_test_123');
    expect(fakeFetch).toHaveBeenCalledOnce();
    const [url, init] = (fakeFetch.mock.calls[0] ?? []) as [
      string,
      RequestInit,
    ];
    expect(url).toContain('/checkout/sessions');
    const bodyText = decodeURIComponent(
      (init.body as URLSearchParams).toString(),
    );
    expect(bodyText).toContain('mode=payment');
    expect(bodyText).toContain('unit_amount]=9999');
  });
});

describe('StripeProvider.refund', () => {
  it('succeeded 為 refunded', async () => {
    const fakeFetch = vi.fn().mockResolvedValue({
      json: () =>
        Promise.resolve({ id: 're_123', status: 'succeeded' }),
    });
    const provider = new StripeProvider({
      secretKey: 'sk_test',
      webhookSecret: SECRET,
      fetchImpl: fakeFetch as unknown as typeof fetch,
    });
    const req: RefundRequest = {
      orderId: 'O-001',
      tenantId: 't1',
      providerTradeId: 'pi_123',
      amount: { amount: 9999, currency: 'USD' },
      idempotencyKey: 'k',
    };
    const result = await provider.refund(req);
    expect(result.status).toBe('refunded');
    expect(result.refundId).toBe('re_123');
  });
});

describe('StripeProvider.parseWebhook', () => {
  it('checkout.session.completed → charge.paid', async () => {
    const provider = new StripeProvider({
      secretKey: 'sk_test',
      webhookSecret: SECRET,
    });
    const body = JSON.stringify({
      id: 'evt_1',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123',
          client_reference_id: 'O-001',
          amount_total: 9999,
          currency: 'usd',
        },
      },
    });
    const sig = buildStripeSig(body, SECRET);
    const event = await provider.parseWebhook(body, {
      'stripe-signature': sig,
    });
    expect(event.signatureValid).toBe(true);
    expect(event.type).toBe('charge.paid');
    expect(event.orderId).toBe('O-001');
    expect(event.amount).toEqual({ amount: 9999, currency: 'USD' });
  });

  it('簽章錯 → signatureValid=false', async () => {
    const provider = new StripeProvider({
      secretKey: 'sk_test',
      webhookSecret: SECRET,
    });
    const event = await provider.parseWebhook('{}', {
      'stripe-signature': 't=1,v1=bad',
    });
    expect(event.signatureValid).toBe(false);
  });

  it('沒帶 header → signatureValid=false', async () => {
    const provider = new StripeProvider({
      secretKey: 'sk_test',
      webhookSecret: SECRET,
    });
    const event = await provider.parseWebhook('{}', {});
    expect(event.signatureValid).toBe(false);
  });

  it('未支援的 event type 也通過簽章但帶 error', async () => {
    const provider = new StripeProvider({
      secretKey: 'sk_test',
      webhookSecret: SECRET,
    });
    const body = JSON.stringify({
      id: 'evt_x',
      type: 'unrelated.event',
      data: { object: {} },
    });
    const sig = buildStripeSig(body, SECRET);
    const event = await provider.parseWebhook(body, {
      'stripe-signature': sig,
    });
    expect(event.signatureValid).toBe(true);
    expect(event.error).toContain('unsupported');
  });
});
