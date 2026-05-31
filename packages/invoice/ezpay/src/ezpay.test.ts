import { describe, expect, it } from 'vitest';

import { aesDecrypt, aesEncrypt, fromQueryString } from './crypto.js';
import { EzpayInvoiceProvider } from './provider.js';

const HASH_KEY = '12345678901234567890123456789012'; // 32 chars
const HASH_IV = '1234567890123456'; // 16 chars

const CONFIG = {
  merchantId: 'M1',
  hashKey: HASH_KEY,
  hashIv: HASH_IV,
  env: 'sandbox' as const,
};

describe('ezPay crypto', () => {
  it('encrypt then decrypt → 還原', () => {
    const cipher = aesEncrypt('a=1&b=2', HASH_KEY, HASH_IV);
    expect(aesDecrypt(cipher, HASH_KEY, HASH_IV)).toBe('a=1&b=2');
  });

  it('fromQueryString 還原物件', () => {
    expect(fromQueryString('a=1&b=2')).toEqual({ a: '1', b: '2' });
  });
});

describe('EzpayInvoiceProvider', () => {
  it('issue 成功 → invoiceNumber 回傳', async () => {
    const fakeFetch: typeof fetch = async () =>
      new Response(
        JSON.stringify({
          Status: 'SUCCESS',
          Message: '',
          Result: JSON.stringify({
            InvoiceTransNo: 'IT-1',
            InvoiceNumber: 'AB12345678',
            CreateTime: '2026-05-15 10:00:00',
            TotalAmt: '100',
          }),
        }),
      );
    const provider = new EzpayInvoiceProvider({ ...CONFIG, fetchImpl: fakeFetch });
    const result = await provider.issue({
      orderId: 'O-1',
      tenantId: 't',
      category: 'B2C',
      carrier: { type: 'mobile-barcode', value: '/ABCD123' },
      items: [{ name: '商品 A', quantity: 1, unitPrice: 100 }],
      totalAmount: 100,
    });
    expect(result.status).toBe('issued');
    expect(result.invoiceNumber).toBe('AB12345678');
  });

  it('issue 失敗 → status pending', async () => {
    const fakeFetch: typeof fetch = async () =>
      new Response(
        JSON.stringify({ Status: 'ERROR', Message: 'invalid carrier', Result: '' }),
      );
    const provider = new EzpayInvoiceProvider({ ...CONFIG, fetchImpl: fakeFetch });
    const result = await provider.issue({
      orderId: 'O-2',
      tenantId: 't',
      category: 'B2C',
      carrier: { type: 'mobile-barcode', value: 'BAD' },
      items: [{ name: '商品', quantity: 1, unitPrice: 100 }],
      totalAmount: 100,
    });
    expect(result.status).toBe('pending');
  });

  it('decryptCallback 還原 ezPay callback 內容', () => {
    const provider = new EzpayInvoiceProvider(CONFIG);
    const cipher = aesEncrypt('InvoiceNumber=AB12345678&Status=1', HASH_KEY, HASH_IV);
    expect(provider.decryptCallback(cipher)).toMatchObject({
      InvoiceNumber: 'AB12345678',
      Status: '1',
    });
  });

  it('config HashKey 長度錯 → throw', () => {
    expect(() => new EzpayInvoiceProvider({ ...CONFIG, hashKey: 'short' })).toThrow();
  });

  it('應稅且 taxAmount 未帶 → 自動以內含 5% 拆解 Amt / TaxAmt', async () => {
    let postedBody: URLSearchParams | undefined;
    const fakeFetch: typeof fetch = async (_url, init) => {
      postedBody = init?.body as URLSearchParams;
      return new Response(
        JSON.stringify({
          Status: 'SUCCESS',
          Result: JSON.stringify({
            InvoiceTransNo: 'IT-1',
            InvoiceNumber: 'AB1',
            CreateTime: '2026-05-15 10:00:00',
            TotalAmt: '1050',
          }),
        }),
      );
    };
    const provider = new EzpayInvoiceProvider({ ...CONFIG, fetchImpl: fakeFetch });
    await provider.issue({
      orderId: 'O-3',
      tenantId: 't',
      category: 'B2C',
      taxType: 'taxable',
      carrier: { type: 'mobile-barcode', value: '/ABCD123' },
      items: [{ name: '商品 A', quantity: 1, unitPrice: 1050 }],
      totalAmount: 1050,
    });
    const cipher = postedBody?.get('PostData_') ?? '';
    const plain = aesDecrypt(cipher, HASH_KEY, HASH_IV);
    const fields = fromQueryString(plain);
    // 1050 內含 5%：tax = round(1050×5/105) = 50；amt = 1000
    expect(fields.Amt).toBe('1000');
    expect(fields.TaxAmt).toBe('50');
    expect(fields.TaxRate).toBe('5');
    expect(fields.TotalAmt).toBe('1050');
  });

  it('item name 內含 `|` 會被替換為全形豎線，避免破壞 ezPay 欄位對齊', async () => {
    let postedBody: URLSearchParams | undefined;
    const fakeFetch: typeof fetch = async (_url, init) => {
      postedBody = init?.body as URLSearchParams;
      return new Response(
        JSON.stringify({ Status: 'SUCCESS', Result: JSON.stringify({}) }),
      );
    };
    const provider = new EzpayInvoiceProvider({ ...CONFIG, fetchImpl: fakeFetch });
    await provider.issue({
      orderId: 'O-4',
      tenantId: 't',
      category: 'B2C',
      taxType: 'tax-free',
      carrier: { type: 'paper' },
      items: [
        { name: 'A | B', quantity: 1, unitPrice: 100 },
        { name: 'C', quantity: 2, unitPrice: 50 },
      ],
      totalAmount: 200,
    });
    const cipher = postedBody?.get('PostData_') ?? '';
    const plain = aesDecrypt(cipher, HASH_KEY, HASH_IV);
    const fields = fromQueryString(plain);
    expect(fields.ItemName).toBe('A ｜ B|C');
  });
});
