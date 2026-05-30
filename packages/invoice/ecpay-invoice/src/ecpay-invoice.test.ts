import { describe, expect, it } from 'vitest';

import { aesDecrypt, aesEncrypt, decodeData, encodeData } from './crypto.js';
import { EcpayInvoiceProvider } from './provider.js';

const HASH_KEY = '1234567890123456';
const HASH_IV = '1234567890123456';

const CONFIG = {
  merchantId: '2000132',
  hashKey: HASH_KEY,
  hashIv: HASH_IV,
  env: 'sandbox' as const,
};

describe('ECPay invoice crypto', () => {
  it('encrypt then decrypt → 還原', () => {
    const cipher = aesEncrypt('hello world', HASH_KEY, HASH_IV);
    expect(aesDecrypt(cipher, HASH_KEY, HASH_IV)).toBe('hello world');
  });
  it('encodeData / decodeData 還原物件', () => {
    const obj = { a: 1, b: '中文 測試' };
    const enc = encodeData(obj, HASH_KEY, HASH_IV);
    const dec = decodeData(enc, HASH_KEY, HASH_IV);
    expect(dec).toEqual(obj);
  });
});

describe('EcpayInvoiceProvider', () => {
  it('issue 成功 → invoiceNumber 回傳', async () => {
    const fakeFetch: typeof fetch = async () => {
      const result = encodeData(
        { RtnCode: 1, RtnMsg: 'ok', InvoiceNo: 'AB12345678', InvoiceDate: '2026-05-15' },
        HASH_KEY,
        HASH_IV,
      );
      return new Response(
        JSON.stringify({ TransCode: 1, TransMsg: '', Data: result }),
      );
    };
    const provider = new EcpayInvoiceProvider({ ...CONFIG, fetchImpl: fakeFetch });
    const r = await provider.issue({
      orderId: 'O-1',
      tenantId: 't',
      category: 'B2C',
      carrier: { type: 'mobile-barcode', value: '/ABCD123' },
      items: [{ name: '商品 A', quantity: 1, unitPrice: 100 }],
      totalAmount: 100,
    });
    expect(r.status).toBe('issued');
    expect(r.invoiceNumber).toBe('AB12345678');
  });

  it('issue 失敗 → status pending', async () => {
    const fakeFetch: typeof fetch = async () => {
      const result = encodeData(
        { RtnCode: 999, RtnMsg: 'fail' },
        HASH_KEY,
        HASH_IV,
      );
      return new Response(
        JSON.stringify({ TransCode: 1, TransMsg: '', Data: result }),
      );
    };
    const provider = new EcpayInvoiceProvider({ ...CONFIG, fetchImpl: fakeFetch });
    const r = await provider.issue({
      orderId: 'O-2',
      tenantId: 't',
      category: 'B2C',
      carrier: { type: 'paper' },
      items: [{ name: '商品', quantity: 1, unitPrice: 100 }],
      totalAmount: 100,
    });
    expect(r.status).toBe('pending');
  });

  it('config 長度錯 → throw', () => {
    expect(() => new EcpayInvoiceProvider({ ...CONFIG, hashKey: 'short' })).toThrow();
  });
});
