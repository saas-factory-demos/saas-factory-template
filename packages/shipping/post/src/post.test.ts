import { describe, expect, it } from 'vitest';

import { PostProvider, signPost } from './index.js';

const CFG = {
  merchantId: 'M',
  apiKey: 'AK',
  signSecret: 'secret',
  env: 'sandbox' as const,
};

describe('PostProvider', () => {
  it('createShipment → throw stub', async () => {
    const p = new PostProvider(CFG);
    await expect(
      p.createShipment({
        tenantId: 't',
        orderId: 'O',
        method: 'post-locker',
        sender: { name: 's', phone: '1' },
        receiver: { name: 'r', phone: '2' },
        pkg: { weightGrams: 500 },
      }),
    ).rejects.toThrow(/awaiting credentials/);
  });

  it('parseWebhook 正確 sig → valid', async () => {
    const p = new PostProvider(CFG);
    const body = JSON.stringify({ trackingNumber: 'P-1', status: 'delivered' });
    const sig = signPost('POST', '/webhook', '0', body, CFG.signSecret);
    const ev = await p.parseWebhook(body, {
      'x-post-signature': sig,
      'x-post-timestamp': '0',
      'x-post-path': '/webhook',
    });
    expect(ev.signatureValid).toBe(true);
    expect(ev.status).toBe('delivered');
  });

  it('parseWebhook 缺 header → invalid', async () => {
    const p = new PostProvider(CFG);
    const ev = await p.parseWebhook('{}', {});
    expect(ev.signatureValid).toBe(false);
  });
});
