import { describe, expect, it } from 'vitest';

import { TapPayProvider } from './index.js';

const CONFIG = {
  partnerKey: 'pk',
  merchantId: 'mid',
  env: 'sandbox' as const,
};

describe('TapPayProvider', () => {
  it('charge stub throw', async () => {
    const provider = new TapPayProvider(CONFIG);
    await expect(
      provider.charge({
        orderId: 'O',
        tenantId: 't',
        method: 'credit',
        amount: { amount: 1, currency: 'TWD' },
        idempotencyKey: 'k',
      }),
    ).rejects.toThrow(/awaiting credentials/);
  });

  it('parseWebhook IP 白名單拒絕', async () => {
    const provider = new TapPayProvider({
      ...CONFIG,
      allowedIps: ['10.0.0.1'],
    });
    const event = await provider.parseWebhook('{"status":0}', {
      'x-forwarded-for': '1.2.3.4',
    });
    expect(event.signatureValid).toBe(false);
  });

  it('parseWebhook 白名單通過 + status=0 為 paid', async () => {
    const provider = new TapPayProvider({
      ...CONFIG,
      allowedIps: ['10.0.0.1'],
    });
    const body = JSON.stringify({
      status: 0,
      order_number: 'O-001',
      rec_trade_id: 'TP1',
    });
    const event = await provider.parseWebhook(body, {
      'x-forwarded-for': '10.0.0.1',
    });
    expect(event.signatureValid).toBe(true);
    expect(event.type).toBe('charge.paid');
  });
});
