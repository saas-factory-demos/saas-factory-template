import { describe, expect, it } from 'vitest';

import { HctProvider, signHct } from './index.js';

const CFG = {
  customerId: 'C',
  username: 'u',
  password: 'p',
  signSecret: 'secret',
  env: 'sandbox' as const,
};

describe('HctProvider', () => {
  it('createShipment 未授權 → throw', async () => {
    const p = new HctProvider(CFG);
    await expect(
      p.createShipment({
        tenantId: 't',
        orderId: 'O',
        method: 'home-delivery',
        sender: { name: 's', phone: '1' },
        receiver: { name: 'r', phone: '2' },
        pkg: { weightGrams: 500 },
      }),
    ).rejects.toThrow(/awaiting credentials/);
  });

  it('parseWebhook 正確 sig → valid', async () => {
    const p = new HctProvider(CFG);
    const body = JSON.stringify({ trackingNumber: 'H-1', status: 'shipping' });
    const sig = signHct(body, CFG.signSecret);
    const ev = await p.parseWebhook(body, { 'x-hct-signature': sig });
    expect(ev.signatureValid).toBe(true);
    expect(ev.status).toBe('in-transit');
  });

  it('parseWebhook 錯 sig → invalid', async () => {
    const p = new HctProvider(CFG);
    const body = JSON.stringify({ trackingNumber: 'H-1' });
    const ev = await p.parseWebhook(body, { 'x-hct-signature': '0'.repeat(64) });
    expect(ev.signatureValid).toBe(false);
  });
});
