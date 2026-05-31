import { describe, expect, it } from 'vitest';

import { PayPalProvider } from './index.js';

const CONFIG = {
  clientId: 'ci',
  clientSecret: 'cs',
  webhookId: 'wh',
  env: 'sandbox' as const,
};

describe('PayPalProvider', () => {
  it('charge stub throw', async () => {
    const provider = new PayPalProvider(CONFIG);
    await expect(
      provider.charge({
        orderId: 'O',
        tenantId: 't',
        method: 'paypal',
        amount: { amount: 1, currency: 'USD' },
        idempotencyKey: 'k',
      }),
    ).rejects.toThrow(/awaiting credentials/);
  });

  it('parseWebhook 缺 header → invalid', async () => {
    const provider = new PayPalProvider(CONFIG);
    const event = await provider.parseWebhook('{}', {});
    expect(event.signatureValid).toBe(false);
    expect(event.error).toContain('missing header');
  });

  it('parseWebhook 齊全 header 仍標 signatureValid=false（待驗）', async () => {
    const provider = new PayPalProvider(CONFIG);
    const body = JSON.stringify({
      id: 'WH-1',
      event_type: 'PAYMENT.CAPTURE.COMPLETED',
      resource: { id: 'PAY-1', custom_id: 'O-001' },
    });
    const event = await provider.parseWebhook(body, {
      'paypal-auth-algo': 'SHA256withRSA',
      'paypal-cert-url': 'https://api.sandbox.paypal.com/cert',
      'paypal-transmission-id': 'tx-1',
      'paypal-transmission-sig': 'sig',
      'paypal-transmission-time': '0',
    });
    expect(event.signatureValid).toBe(false);
    expect(event.error).toContain('not implemented');
    expect(event.orderId).toBe('O-001');
  });
});
