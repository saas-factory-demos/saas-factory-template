import { describe, expect, it, vi } from 'vitest';

import {
  aesDecrypt,
  aesEncrypt,
  buildTradeSha,
  NewebPayProvider,
  toQueryString,
  verifyTradeSha,
} from './index.js';

import type {
  ChargeRequest,
  RefundRequest,
} from '@saas-factory/payment-core';

const TEST_CONFIG = {
  merchantId: 'MS123',
  hashKey: 'A'.repeat(32),
  hashIv: 'B'.repeat(16),
  env: 'sandbox' as const,
};

describe('crypto', () => {
  it('AES 加解密能還原原文', () => {
    const plain = 'MerchantID=MS123&Amt=100';
    const cipher = aesEncrypt(plain, TEST_CONFIG.hashKey, TEST_CONFIG.hashIv);
    expect(cipher).not.toBe(plain);
    expect(aesDecrypt(cipher, TEST_CONFIG.hashKey, TEST_CONFIG.hashIv)).toBe(
      plain,
    );
  });

  it('TradeSha 為大寫 64 位 hex', () => {
    const sha = buildTradeSha('abc', TEST_CONFIG.hashKey, TEST_CONFIG.hashIv);
    expect(sha).toMatch(/^[0-9A-F]{64}$/);
  });

  it('verifyTradeSha 正確接受合法簽章', () => {
    const cipher = aesEncrypt('x=1', TEST_CONFIG.hashKey, TEST_CONFIG.hashIv);
    const sha = buildTradeSha(cipher, TEST_CONFIG.hashKey, TEST_CONFIG.hashIv);
    expect(
      verifyTradeSha(cipher, sha, TEST_CONFIG.hashKey, TEST_CONFIG.hashIv),
    ).toBe(true);
  });

  it('verifyTradeSha 拒絕被竄改的簽章', () => {
    const cipher = aesEncrypt('x=1', TEST_CONFIG.hashKey, TEST_CONFIG.hashIv);
    const tampered = '0'.repeat(64);
    expect(
      verifyTradeSha(cipher, tampered, TEST_CONFIG.hashKey, TEST_CONFIG.hashIv),
    ).toBe(false);
  });

  it('HashKey 長度錯誤會 throw', () => {
    expect(() => aesEncrypt('x', 'short', 'B'.repeat(16))).toThrow();
  });
});

describe('NewebPayProvider.charge', () => {
  const provider = new NewebPayProvider(TEST_CONFIG);
  const baseReq: ChargeRequest = {
    orderId: 'O-001',
    tenantId: 't1',
    method: 'credit',
    amount: { amount: 990, currency: 'TWD' },
    idempotencyKey: 'O-001-charge',
    notifyUrl: 'https://example.com/cb',
    returnUrl: 'https://example.com/done',
  };

  it('回傳含 TradeInfo + TradeSha 且 sha 可驗證', async () => {
    const result = await provider.charge(baseReq);
    expect(result.status).toBe('pending');
    expect(result.redirectUrl).toContain('ccore.newebpay.com');
    const raw = result.raw as {
      TradeInfo: string;
      TradeSha: string;
    };
    expect(raw.TradeInfo).toMatch(/^[0-9a-f]+$/);
    expect(
      verifyTradeSha(
        raw.TradeInfo,
        raw.TradeSha,
        TEST_CONFIG.hashKey,
        TEST_CONFIG.hashIv,
      ),
    ).toBe(true);
  });

  it('解開 TradeInfo 可看到正確金額與訂單編號', async () => {
    const result = await provider.charge(baseReq);
    const raw = result.raw as { TradeInfo: string };
    const decrypted = aesDecrypt(
      raw.TradeInfo,
      TEST_CONFIG.hashKey,
      TEST_CONFIG.hashIv,
    );
    expect(decrypted).toContain('Amt=990');
    expect(decrypted).toContain('MerchantOrderNo=O-001');
  });

  it('非 TWD 幣別會 throw', async () => {
    await expect(
      provider.charge({
        ...baseReq,
        amount: { amount: 100, currency: 'USD' },
      }),
    ).rejects.toThrow();
  });
});

describe('NewebPayProvider.parseWebhook', () => {
  const provider = new NewebPayProvider(TEST_CONFIG);

  it('合法 callback 解析為 charge.paid', async () => {
    const callbackBody = {
      Status: 'SUCCESS',
      Message: 'OK',
      Result: {
        MerchantOrderNo: 'O-001',
        TradeNo: 'NPT123',
        Amt: 990,
      },
    };
    const cipher = aesEncrypt(
      JSON.stringify(callbackBody),
      TEST_CONFIG.hashKey,
      TEST_CONFIG.hashIv,
    );
    const sha = buildTradeSha(
      cipher,
      TEST_CONFIG.hashKey,
      TEST_CONFIG.hashIv,
    );
    const rawBody = toQueryString({ TradeInfo: cipher, TradeSha: sha });
    const event = await provider.parseWebhook(rawBody, {});
    expect(event.signatureValid).toBe(true);
    expect(event.type).toBe('charge.paid');
    expect(event.orderId).toBe('O-001');
    expect(event.providerTradeId).toBe('NPT123');
    expect(event.amount).toEqual({ amount: 990, currency: 'TWD' });
  });

  it('簽章錯誤 → signatureValid=false', async () => {
    const cipher = aesEncrypt(
      '{}',
      TEST_CONFIG.hashKey,
      TEST_CONFIG.hashIv,
    );
    const rawBody = toQueryString({
      TradeInfo: cipher,
      TradeSha: '0'.repeat(64),
    });
    const event = await provider.parseWebhook(rawBody, {});
    expect(event.signatureValid).toBe(false);
    expect(event.error).toContain('TradeSha mismatch');
  });

  it('缺少欄位 → signatureValid=false', async () => {
    const event = await provider.parseWebhook('', {});
    expect(event.signatureValid).toBe(false);
  });

  it('MerchantID 與設定不符 → signatureValid=false', async () => {
    const callbackBody = {
      Status: 'SUCCESS',
      Message: 'OK',
      Result: {
        MerchantID: 'OTHER',
        MerchantOrderNo: 'O-001',
        TradeNo: 'NPT123',
        Amt: 100,
      },
    };
    const cipher = aesEncrypt(
      JSON.stringify(callbackBody),
      TEST_CONFIG.hashKey,
      TEST_CONFIG.hashIv,
    );
    const sha = buildTradeSha(
      cipher,
      TEST_CONFIG.hashKey,
      TEST_CONFIG.hashIv,
    );
    const rawBody = toQueryString({ TradeInfo: cipher, TradeSha: sha });
    const event = await provider.parseWebhook(rawBody, {});
    expect(event.signatureValid).toBe(false);
    expect(event.error).toMatch(/MerchantID/);
  });

  it('PayTime 過期 → signatureValid=false（防 replay）', async () => {
    const callbackBody = {
      Status: 'SUCCESS',
      Message: 'OK',
      Result: {
        MerchantOrderNo: 'O-001',
        TradeNo: 'NPT123',
        Amt: 100,
        PayTime: '2020-01-01 00:00:00',
      },
    };
    const cipher = aesEncrypt(
      JSON.stringify(callbackBody),
      TEST_CONFIG.hashKey,
      TEST_CONFIG.hashIv,
    );
    const sha = buildTradeSha(
      cipher,
      TEST_CONFIG.hashKey,
      TEST_CONFIG.hashIv,
    );
    const rawBody = toQueryString({ TradeInfo: cipher, TradeSha: sha });
    const event = await provider.parseWebhook(rawBody, {});
    expect(event.signatureValid).toBe(false);
    expect(event.error).toMatch(/tolerance/);
  });
});

describe('NewebPayProvider.refund', () => {
  it('成功 callback 回 refunded', async () => {
    const fakeFetch = vi.fn().mockResolvedValue({
      json: () =>
        Promise.resolve({
          Status: 'SUCCESS',
          Result: { MerchantOrderNo: 'O-001', TradeNo: 'NPT123' },
        }),
    });
    const provider = new NewebPayProvider({
      ...TEST_CONFIG,
      fetchImpl: fakeFetch as unknown as typeof fetch,
    });
    const req: RefundRequest = {
      orderId: 'O-001',
      tenantId: 't1',
      providerTradeId: 'NPT123',
      amount: { amount: 990, currency: 'TWD' },
      idempotencyKey: 'O-001-refund',
    };
    const result = await provider.refund(req);
    expect(result.status).toBe('refunded');
    expect(result.refundId).toBe('NPT123');
    expect(fakeFetch).toHaveBeenCalledOnce();
  });

  it('沒帶 amount 會 throw', async () => {
    const provider = new NewebPayProvider(TEST_CONFIG);
    await expect(
      provider.refund({
        orderId: 'O-001',
        tenantId: 't1',
        providerTradeId: 'x',
        idempotencyKey: 'k',
      }),
    ).rejects.toThrow(/amount/);
  });
});
