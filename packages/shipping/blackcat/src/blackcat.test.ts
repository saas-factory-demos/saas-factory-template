import { describe, expect, it } from 'vitest';

import { BlackcatProvider, signBlackcat } from './index.js';

const CFG = {
  customerId: 'CID',
  apiKey: 'AK',
  signSecret: 'secret',
  env: 'sandbox' as const,
};

describe('BlackcatProvider', () => {
  it('createShipment 未授權 → throw', async () => {
    const provider = new BlackcatProvider(CFG);
    await expect(
      provider.createShipment({
        tenantId: 't',
        orderId: 'O',
        method: 'home-delivery',
        sender: { name: 's', phone: '1' },
        receiver: { name: 'r', phone: '2' },
        pkg: { weightGrams: 1000 },
      }),
    ).rejects.toThrow(/awaiting credentials/);
  });

  it('parseWebhook 缺 sig → invalid', async () => {
    const provider = new BlackcatProvider(CFG);
    const ev = await provider.parseWebhook('{}', {});
    expect(ev.signatureValid).toBe(false);
  });

  it('parseWebhook 正確 sig → valid + status 對映', async () => {
    const provider = new BlackcatProvider(CFG);
    const body = JSON.stringify({
      trackingNumber: 'T-1',
      orderId: 'O-1',
      status: 'delivered',
    });
    const sig = signBlackcat(body, CFG.signSecret);
    const ev = await provider.parseWebhook(body, { 'x-blackcat-signature': sig });
    expect(ev.signatureValid).toBe(true);
    expect(ev.status).toBe('delivered');
    expect(ev.trackingNumber).toBe('T-1');
  });

  it('parseWebhook 錯誤 sig → invalid', async () => {
    const provider = new BlackcatProvider(CFG);
    const body = JSON.stringify({ trackingNumber: 'T-1', status: 'in_transit' });
    const ev = await provider.parseWebhook(body, {
      'x-blackcat-signature': '0'.repeat(64),
    });
    expect(ev.signatureValid).toBe(false);
  });
});
