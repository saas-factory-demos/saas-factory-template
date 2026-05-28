import { describe, expect, it, vi } from 'vitest';

import {
  buildCheckMacValue,
  EcpayProvider,
  verifyCheckMacValue,
} from './index.js';

import type { ChargeRequest } from '@saas-factory/payment-core';

const TEST_CONFIG = {
  merchantId: '2000132',
  hashKey: 'pwFHCqoQZGmho4w6',
  hashIv: 'EkRm7iFT261dpevs',
  env: 'sandbox' as const,
};

/** 產生 ECPay 回呼格式的台北時間字串。 */
function formatTaipei(date: Date): string {
  const taipei = new Date(date.getTime() + 8 * 60 * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${taipei.getUTCFullYear()}/${pad(taipei.getUTCMonth() + 1)}/${pad(
    taipei.getUTCDate(),
  )} ${pad(taipei.getUTCHours())}:${pad(taipei.getUTCMinutes())}:${pad(
    taipei.getUTCSeconds(),
  )}`;
}

describe('CheckMacValue', () => {
  // 綠界官方文件範例：
  // MerchantID=2000132 + MerchantTradeNo=2000132u + ... 等
  // 用同樣 HashKey/HashIV 應可重現一致的 MAC
  it('產生 64 位大寫 hex', () => {
    const mac = buildCheckMacValue(
      { MerchantID: 'X', TotalAmount: 100 },
      TEST_CONFIG.hashKey,
      TEST_CONFIG.hashIv,
    );
    expect(mac).toMatch(/^[0-9A-F]{64}$/);
  });

  it('verifyCheckMacValue 接受合法簽章', () => {
    const params = { MerchantID: 'X', TotalAmount: 100 };
    const mac = buildCheckMacValue(
      params,
      TEST_CONFIG.hashKey,
      TEST_CONFIG.hashIv,
    );
    expect(
      verifyCheckMacValue(params, mac, TEST_CONFIG.hashKey, TEST_CONFIG.hashIv),
    ).toBe(true);
  });

  it('verifyCheckMacValue 拒絕被竄改', () => {
    const params = { MerchantID: 'X', TotalAmount: 100 };
    expect(
      verifyCheckMacValue(
        params,
        '0'.repeat(64),
        TEST_CONFIG.hashKey,
        TEST_CONFIG.hashIv,
      ),
    ).toBe(false);
  });

  it('參數順序不影響 MAC', () => {
    const a = buildCheckMacValue(
      { B: '2', A: '1' },
      TEST_CONFIG.hashKey,
      TEST_CONFIG.hashIv,
    );
    const b = buildCheckMacValue(
      { A: '1', B: '2' },
      TEST_CONFIG.hashKey,
      TEST_CONFIG.hashIv,
    );
    expect(a).toBe(b);
  });
});

describe('EcpayProvider.charge', () => {
  const provider = new EcpayProvider(TEST_CONFIG);
  const baseReq: ChargeRequest = {
    orderId: 'O-001',
    tenantId: 't1',
    method: 'credit',
    amount: { amount: 990, currency: 'TWD' },
    idempotencyKey: 'O-001-charge',
    notifyUrl: 'https://example.com/cb',
  };

  it('回傳完整 params 含 CheckMacValue', async () => {
    const result = await provider.charge(baseReq);
    expect(result.redirectUrl).toContain('payment-stage.ecpay.com.tw');
    const raw = result.raw as Record<string, string>;
    expect(raw.CheckMacValue).toMatch(/^[0-9A-F]{64}$/);
    expect(raw.ChoosePayment).toBe('Credit');
    expect(raw.TotalAmount).toBe(990);
  });

  it('信用卡分期填 CreditInstallment', async () => {
    const result = await provider.charge({
      ...baseReq,
      method: 'credit-installment',
      installment: 6,
    });
    const raw = result.raw as Record<string, string | number>;
    expect(raw.CreditInstallment).toBe(6);
  });

  it('非 TWD 拒絕', async () => {
    await expect(
      provider.charge({
        ...baseReq,
        amount: { amount: 1, currency: 'USD' },
      }),
    ).rejects.toThrow();
  });
});

describe('EcpayProvider.parseWebhook', () => {
  const provider = new EcpayProvider(TEST_CONFIG);

  it('合法 callback 解析 charge.paid', async () => {
    const params = {
      MerchantID: TEST_CONFIG.merchantId,
      MerchantTradeNo: 'O-001',
      TradeNo: 'EP123',
      TradeAmt: 990,
      RtnCode: 1,
      RtnMsg: '交易成功',
      PaymentDate: formatTaipei(new Date()),
      PaymentType: 'Credit_CreditCard',
    };
    const mac = buildCheckMacValue(
      params,
      TEST_CONFIG.hashKey,
      TEST_CONFIG.hashIv,
    );
    const body = new URLSearchParams({
      ...Object.fromEntries(
        Object.entries(params).map(([k, v]) => [k, String(v)]),
      ),
      CheckMacValue: mac,
    }).toString();
    const event = await provider.parseWebhook(body, {});
    expect(event.signatureValid).toBe(true);
    expect(event.type).toBe('charge.paid');
    expect(event.orderId).toBe('O-001');
    expect(event.providerTradeId).toBe('EP123');
    expect(event.amount).toEqual({ amount: 990, currency: 'TWD' });
  });

  it('簽章錯誤 → signatureValid=false', async () => {
    const body =
      'MerchantID=2000132&MerchantTradeNo=O-001&TradeAmt=990&RtnCode=1&CheckMacValue=' +
      '0'.repeat(64);
    const event = await provider.parseWebhook(body, {});
    expect(event.signatureValid).toBe(false);
  });

  it('PaymentDate 過期 → signatureValid=false（防 replay）', async () => {
    const params = {
      MerchantID: TEST_CONFIG.merchantId,
      MerchantTradeNo: 'O-002',
      TradeNo: 'EP124',
      TradeAmt: 100,
      RtnCode: 1,
      RtnMsg: 'OK',
      PaymentDate: '2020/01/01 00:00:00',
      PaymentType: 'Credit_CreditCard',
    };
    const mac = buildCheckMacValue(
      params,
      TEST_CONFIG.hashKey,
      TEST_CONFIG.hashIv,
    );
    const body = new URLSearchParams({
      ...Object.fromEntries(
        Object.entries(params).map(([k, v]) => [k, String(v)]),
      ),
      CheckMacValue: mac,
    }).toString();
    const event = await provider.parseWebhook(body, {});
    expect(event.signatureValid).toBe(false);
    expect(event.error).toMatch(/tolerance/);
  });

  it('MerchantID 不符 → signatureValid=false', async () => {
    const params = {
      MerchantID: '9999999',
      MerchantTradeNo: 'O-003',
      TradeNo: 'EP125',
      TradeAmt: 100,
      RtnCode: 1,
      RtnMsg: 'OK',
      PaymentDate: formatTaipei(new Date()),
      PaymentType: 'Credit_CreditCard',
    };
    const mac = buildCheckMacValue(
      params,
      TEST_CONFIG.hashKey,
      TEST_CONFIG.hashIv,
    );
    const body = new URLSearchParams({
      ...Object.fromEntries(
        Object.entries(params).map(([k, v]) => [k, String(v)]),
      ),
      CheckMacValue: mac,
    }).toString();
    const event = await provider.parseWebhook(body, {});
    expect(event.signatureValid).toBe(false);
    expect(event.error).toMatch(/MerchantID/);
  });

  it('缺 CheckMacValue → signatureValid=false', async () => {
    const event = await provider.parseWebhook('Foo=1', {});
    expect(event.signatureValid).toBe(false);
  });
});

describe('EcpayProvider.refund', () => {
  it('RtnCode=1 為 refunded', async () => {
    const fakeFetch = vi.fn().mockResolvedValue({
      text: () => Promise.resolve('RtnCode=1&RtnMsg=success'),
    });
    const provider = new EcpayProvider({
      ...TEST_CONFIG,
      fetchImpl: fakeFetch as unknown as typeof fetch,
    });
    const result = await provider.refund({
      orderId: 'O-001',
      tenantId: 't1',
      providerTradeId: 'EP123',
      amount: { amount: 990, currency: 'TWD' },
      idempotencyKey: 'k',
    });
    expect(result.status).toBe('refunded');
    expect(fakeFetch).toHaveBeenCalledOnce();
  });

  it('RtnCode 非 1 為 failed', async () => {
    const fakeFetch = vi.fn().mockResolvedValue({
      text: () => Promise.resolve('RtnCode=0&RtnMsg=fail'),
    });
    const provider = new EcpayProvider({
      ...TEST_CONFIG,
      fetchImpl: fakeFetch as unknown as typeof fetch,
    });
    const result = await provider.refund({
      orderId: 'O-001',
      tenantId: 't1',
      providerTradeId: 'EP123',
      amount: { amount: 990, currency: 'TWD' },
      idempotencyKey: 'k',
    });
    expect(result.status).toBe('failed');
  });
});
