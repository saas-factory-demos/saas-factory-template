import { describe, expect, it } from 'vitest';

import { InternationalProvider, signInternational } from './index.js';

const CFG = {
  carrier: 'dhl' as const,
  clientId: 'id',
  clientSecret: 'sec',
  signSecret: 'secret',
  env: 'sandbox' as const,
};

describe('InternationalProvider', () => {
  it('createShipment → throw stub', async () => {
    const p = new InternationalProvider(CFG);
    await expect(
      p.createShipment({
        tenantId: 't',
        orderId: 'O',
        method: 'international-express',
        sender: { name: 's', phone: '1', country: 'TW' },
        receiver: { name: 'r', phone: '2', country: 'US' },
        pkg: { weightGrams: 1500 },
      }),
    ).rejects.toThrow(/awaiting credentials/);
  });

  it('parseWebhook 正確 sig → valid', async () => {
    const p = new InternationalProvider(CFG);
    const body = JSON.stringify({ trackingNumber: 'D-1', status: 'IN_TRANSIT' });
    const sig = signInternational(body, CFG.signSecret);
    const ev = await p.parseWebhook(body, { 'x-shipping-signature': sig });
    expect(ev.signatureValid).toBe(true);
    expect(ev.status).toBe('in-transit');
    expect(ev.raw).toMatchObject({ carrier: 'dhl' });
  });

  it('parseWebhook 錯 sig → invalid', async () => {
    const p = new InternationalProvider(CFG);
    const ev = await p.parseWebhook('{}', { 'x-shipping-signature': '0'.repeat(64) });
    expect(ev.signatureValid).toBe(false);
  });
});
