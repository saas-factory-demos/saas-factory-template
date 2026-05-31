import { describe, expect, it } from 'vitest';

import { JkoPayOfficialProvider, buildJkoSignature } from './index.js';

const CONFIG = { apiKey: 'ak', secret: 'sec', env: 'sandbox' as const };

describe('JkoPay signature', () => {
  it('hex 64 字元', () => {
    const sig = buildJkoSignature('ak', 'sec', 'n', '0', '{}');
    expect(sig).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe('JkoPayOfficialProvider', () => {
  const provider = new JkoPayOfficialProvider(CONFIG);

  it('charge stub throw', async () => {
    await expect(
      provider.charge({
        orderId: 'O',
        tenantId: 't',
        method: 'jkopay',
        amount: { amount: 1, currency: 'TWD' },
        idempotencyKey: 'k',
      }),
    ).rejects.toThrow(/awaiting credentials/);
  });

  it('parseWebhook 合法簽章 OK', async () => {
    const body = JSON.stringify({
      merchantTradeNo: 'O-001',
      platformTradeNo: 'JKO-1',
    });
    const ts = String(Date.now());
    const sig = buildJkoSignature('ak', 'sec', 'n', ts, body);
    const event = await provider.parseWebhook(body, {
      'x-jko-signature': sig,
      'x-jko-nonce': 'n',
      'x-jko-timestamp': ts,
      'x-jko-apikey': 'ak',
    });
    expect(event.signatureValid).toBe(true);
    expect(event.orderId).toBe('O-001');
  });

  it('parseWebhook 簽章錯誤 false', async () => {
    const ts = String(Date.now());
    const event = await provider.parseWebhook('{}', {
      'x-jko-signature': 'bad',
      'x-jko-nonce': 'n',
      'x-jko-timestamp': ts,
      'x-jko-apikey': 'ak',
    });
    expect(event.signatureValid).toBe(false);
  });

  it('parseWebhook 過期時間戳 → 拒絕（防 replay）', async () => {
    const body = JSON.stringify({ merchantTradeNo: 'O-002' });
    const staleTs = String(Date.now() - 10 * 60 * 1000);
    const sig = buildJkoSignature('ak', 'sec', 'n', staleTs, body);
    const event = await provider.parseWebhook(body, {
      'x-jko-signature': sig,
      'x-jko-nonce': 'n',
      'x-jko-timestamp': staleTs,
      'x-jko-apikey': 'ak',
    });
    expect(event.signatureValid).toBe(false);
    expect(event.error).toMatch(/tolerance/);
  });
});
