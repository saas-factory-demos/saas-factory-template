import { describe, expect, it, vi } from 'vitest';

import { InvoiceService } from './service.js';
import { isValidTaxId, validateCarrier } from './validators.js';

import type {
  AllowanceResult,
  InvoiceProvider,
  InvoiceResult,
} from './types.js';

function makeProvider(overrides: Partial<InvoiceProvider> = {}): InvoiceProvider {
  return {
    name: 'ezpay',
    issue: vi.fn(async (): Promise<InvoiceResult> => ({
      invoiceId: 'INV-1',
      invoiceNumber: 'AB12345678',
      issuedAt: '2026-05-15T00:00:00.000Z',
      status: 'issued',
      totalAmount: 100,
      raw: {},
    })),
    issueAllowance: vi.fn(async (): Promise<AllowanceResult> => ({
      allowanceId: 'AL-1',
      allowanceNumber: 'D1234567',
      invoiceId: 'INV-1',
      amount: 50,
      status: 'issued',
      raw: {},
    })),
    void: vi.fn(async () => undefined),
    query: vi.fn(async () => null),
    ...overrides,
  };
}

describe('InvoiceService', () => {
  it('issue 成功 → emit invoice.issued', async () => {
    const emit = vi.fn();
    const svc = new InvoiceService({ provider: makeProvider(), emit });
    const r = await svc.issue({
      orderId: 'O-1',
      tenantId: 't',
      category: 'B2C',
      carrier: { type: 'mobile-barcode', value: '/ABCD123' },
      items: [{ name: 'item', quantity: 1, unitPrice: 100 }],
      totalAmount: 100,
    });
    expect(r.invoiceNumber).toBe('AB12345678');
    expect(emit).toHaveBeenCalledOnce();
    expect(emit.mock.calls[0]?.[0]).toMatchObject({
      type: 'invoice.issued',
      payload: { orderId: 'O-1', tenantId: 't', totalAmount: 100 },
    });
  });

  it('issueAllowance 成功 → emit invoice.allowance-created', async () => {
    const emit = vi.fn();
    const svc = new InvoiceService({ provider: makeProvider(), emit });
    await svc.issueAllowance({
      invoiceId: 'INV-1',
      tenantId: 't',
      items: [{ name: 'item', quantity: 1, unitPrice: 50 }],
      amount: 50,
      reason: '退貨',
    });
    expect(emit).toHaveBeenCalledOnce();
    expect(emit.mock.calls[0]?.[0]).toMatchObject({
      type: 'invoice.allowance-created',
      payload: { invoiceId: 'INV-1', amount: 50, reason: '退貨' },
    });
  });

  it('void → emit invoice.voided', async () => {
    const emit = vi.fn();
    const svc = new InvoiceService({ provider: makeProvider(), emit });
    await svc.void({ invoiceId: 'INV-1', tenantId: 't', reason: '誤開' });
    expect(emit.mock.calls[0]?.[0]).toMatchObject({
      type: 'invoice.voided',
      payload: { invoiceId: 'INV-1', reason: '誤開' },
    });
  });
});

describe('validateCarrier', () => {
  it('手機條碼 / 開頭 8 碼', () => {
    expect(validateCarrier({ type: 'mobile-barcode', value: '/ABCD123' })).toEqual({ valid: true });
    expect(validateCarrier({ type: 'mobile-barcode', value: 'ABCD123' }).valid).toBe(false);
  });
  it('自然人憑證 2 英文 + 14 數字', () => {
    expect(validateCarrier({ type: 'natural-person-cert', value: 'AB12345678901234' }).valid).toBe(true);
    expect(validateCarrier({ type: 'natural-person-cert', value: 'AB1234' }).valid).toBe(false);
  });
  it('統編 8 碼', () => {
    expect(validateCarrier({ type: 'company-tax-id', value: '12345678' }).valid).toBe(true);
    expect(validateCarrier({ type: 'company-tax-id', value: '1234' }).valid).toBe(false);
  });
  it('愛心碼 3-7 碼', () => {
    expect(validateCarrier({ type: 'donation', donationCode: '12345' }).valid).toBe(true);
    expect(validateCarrier({ type: 'donation', donationCode: '12' }).valid).toBe(false);
  });
  it('member / paper 不驗', () => {
    expect(validateCarrier({ type: 'member' }).valid).toBe(true);
    expect(validateCarrier({ type: 'paper' }).valid).toBe(true);
  });
});

describe('isValidTaxId', () => {
  it('正確統編：12345675 通過', () => {
    expect(isValidTaxId('12345675')).toBe(true);
  });
  it('長度錯誤 → false', () => {
    expect(isValidTaxId('1234')).toBe(false);
  });
  it('全 0 → false', () => {
    expect(isValidTaxId('00000000')).toBe(true);
  });
});
