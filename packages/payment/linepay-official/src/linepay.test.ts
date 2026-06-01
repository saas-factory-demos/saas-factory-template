import { describe, expect, it } from 'vitest';

import {
  buildLinePaySignature,
  LinePayOfficialProvider,
  verifyLinePaySignature,
} from './index.js';

const CONFIG = {
  channelId: 'ch_x',
  channelSecret: 'secret_x',
  env: 'sandbox' as const,
};

describe('LINE Pay signature', () => {
  it('buildLinePaySignature 為 base64 字串', () => {
    const sig = buildLinePaySignature('s', '/u', '{}', 'n1');
    expect(sig).toMatch(/^[A-Za-z0-9+/]+=*$/);
  });

  it('verifyLinePaySignature 接受合法簽章', () => {
    const sig = buildLinePaySignature('s', '/u', '{}', 'n1');
    expect(verifyLinePaySignature('s', '/u', '{}', 'n1', sig)).toBe(true);
  });

  it('verifyLinePaySignature 拒絕竄改', () => {
    expect(verifyLinePaySignature('s', '/u', '{}', 'n1', 'bad')).toBe(false);
  });

  it('verifyLinePaySignature 對相同長度但不同內容亦拒絕（timingSafe）', () => {
    const sig = buildLinePaySignature('s', '/u', '{}', 'n1');
    const tampered = sig.split('').reverse().join('');
    expect(tampered.length).toBe(sig.length);
    expect(verifyLinePaySignature('s', '/u', '{}', 'n1', tampered)).toBe(false);
  });
});

describe('LinePayOfficialProvider', () => {
  const provider = new LinePayOfficialProvider(CONFIG);

  it('charge 走 stub throw', async () => {
    await expect(
      provider.charge({
        orderId: 'O',
        tenantId: 't',
        method: 'linepay',
        amount: { amount: 1, currency: 'TWD' },
        idempotencyKey: 'k',
      }),
    ).rejects.toThrow(/awaiting credentials/);
  });

  it('parseWebhook 缺 header → signatureValid=false', async () => {
    const event = await provider.parseWebhook('{}', {});
    expect(event.signatureValid).toBe(false);
  });

  it('parseWebhook 合法簽章 → charge.paid', async () => {
    const body = JSON.stringify({ orderId: 'O-001', transactionId: 'LP1' });
    const sig = buildLinePaySignature(
      CONFIG.channelSecret,
      '/payments/notify',
      body,
      'nonce-1',
    );
    const event = await provider.parseWebhook(body, {
      'x-line-authorization': sig,
      'x-line-authorization-nonce': 'nonce-1',
    });
    expect(event.signatureValid).toBe(true);
    expect(event.orderId).toBe('O-001');
  });

  it('signRequest 回完整 headers', () => {
    const headers = provider.signRequest('/v3/payments/request', '{}', 'n1');
    expect(headers['X-LINE-ChannelId']).toBe('ch_x');
    expect(headers['X-LINE-Authorization-Nonce']).toBe('n1');
    expect(headers['X-LINE-Authorization']).toBeTruthy();
  });
});
