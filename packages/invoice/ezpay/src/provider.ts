/**
 * 藍新 ezPay 電子發票 Provider。
 *
 * API 端點：
 * - sandbox: https://cinv.ezpay.com.tw/Api/invoice_issue
 * - production: https://inv.ezpay.com.tw/Api/invoice_issue
 *
 * 載具對應（ezPay `CarrierType`）：
 * - `''`（空）+ `Print=1`：紙本
 * - `'0'`：手機條碼
 * - `'1'`：自然人憑證
 * - `'2'`：ezPay 會員載具
 * - 統編：`BuyerUBN` 帶值即可
 * - 捐贈：`Category=B2C` + `LoveCode=...`
 *
 * 規格出處：ezPay 電子發票 API 文件 v1.5。
 */

import { aesDecrypt, aesEncrypt, fromQueryString, toQueryString } from './crypto.js';

import type {
  AllowanceResult,
  InvoiceCarrier,
  InvoiceItem,
  InvoiceProvider,
  InvoiceResult,
  IssueAllowanceParams,
  IssueInvoiceParams,
  VoidInvoiceParams,
} from '@saas-factory/invoice-core';

export interface EzpayInvoiceConfig {
  merchantId: string;
  hashKey: string;
  hashIv: string;
  env: 'sandbox' | 'production';
  fetchImpl?: typeof fetch;
}

const ENDPOINTS: Record<
  EzpayInvoiceConfig['env'],
  { issue: string; allowance: string; void: string; query: string }
> = {
  production: {
    issue: 'https://inv.ezpay.com.tw/Api/invoice_issue',
    allowance: 'https://inv.ezpay.com.tw/Api/allowance_issue',
    void: 'https://inv.ezpay.com.tw/Api/invoice_invalid',
    query: 'https://inv.ezpay.com.tw/Api/invoice_search',
  },
  sandbox: {
    issue: 'https://cinv.ezpay.com.tw/Api/invoice_issue',
    allowance: 'https://cinv.ezpay.com.tw/Api/allowance_issue',
    void: 'https://cinv.ezpay.com.tw/Api/invoice_invalid',
    query: 'https://cinv.ezpay.com.tw/Api/invoice_search',
  },
};

/** 轉換 carrier → ezPay 欄位。 */
function carrierToEzpay(carrier: InvoiceCarrier): Record<string, string | number> {
  switch (carrier.type) {
    case 'mobile-barcode':
      return { CarrierType: '0', CarrierNum: carrier.value ?? '', Print: 0 };
    case 'natural-person-cert':
      return { CarrierType: '1', CarrierNum: carrier.value ?? '', Print: 0 };
    case 'company-tax-id':
      return { BuyerUBN: carrier.value ?? '', Print: 1 };
    case 'donation':
      return { LoveCode: carrier.donationCode ?? '', Print: 0 };
    case 'member':
      return { CarrierType: '2', CarrierNum: carrier.value ?? '', Print: 0 };
    case 'paper':
      return { Print: 1 };
    default: {
      const _exhaustive: never = carrier.type;
      throw new Error(`unknown carrier type: ${String(_exhaustive)}`);
    }
  }
}

/** ezPay 以 `|` 作為欄位分隔，名稱內若含 `|` 會破壞欄位對齊；強制替換為全形豎線。 */
function sanitizeItemName(name: string): string {
  return name.replace(/\|/g, '｜');
}

/** 拆解 items → ItemName / ItemCount / ItemUnit / ItemPrice / ItemAmt（| 分隔）。 */
function itemsToFields(items: InvoiceItem[]): Record<string, string | number> {
  return {
    ItemName: items.map((i) => sanitizeItemName(i.name)).join('|'),
    ItemCount: items.map((i) => i.quantity).join('|'),
    ItemUnit: items.map((i) => sanitizeItemName(i.unit ?? '個')).join('|'),
    ItemPrice: items.map((i) => i.unitPrice).join('|'),
    ItemAmt: items
      .map((i) => i.quantity * i.unitPrice)
      .join('|'),
  };
}

/**
 * 計算台灣 5% 內含稅應稅金額拆解。
 * 規則：tax = round(total × 5 / 105)，net = total − tax。
 */
function splitTaxableAmount(totalAmount: number): { amt: number; taxAmt: number } {
  const taxAmt = Math.round((totalAmount * 5) / 105);
  return { amt: totalAmount - taxAmt, taxAmt };
}

const TAX_TYPE_MAP = {
  taxable: 1,
  'zero-tax': 2,
  'tax-free': 3,
  mixed: 9,
} as const;

/**
 * 藍新 ezPay 發票 Provider。
 */
export class EzpayInvoiceProvider implements InvoiceProvider {
  readonly name = 'ezpay' as const;

  constructor(private readonly config: EzpayInvoiceConfig) {
    if (config.hashKey.length !== 32 || config.hashIv.length !== 16) {
      throw new Error('ezPay invoice config: HashKey 32 + HashIV 16 必填');
    }
  }

  async issue(params: IssueInvoiceParams): Promise<InvoiceResult> {
    const taxType = TAX_TYPE_MAP[params.taxType ?? 'taxable'];
    // 應稅且呼叫端未自帶 taxAmount 時，依台灣內含 5% 稅率自動拆解；
    // 直接送 TaxAmt=0 + TaxRate=5 會被 ezPay 拒絕或產生稅務金額錯誤的發票。
    const { amt, taxAmt } =
      taxType === 1
        ? params.taxAmount != null
          ? { amt: params.totalAmount - params.taxAmount, taxAmt: params.taxAmount }
          : splitTaxableAmount(params.totalAmount)
        : { amt: params.totalAmount, taxAmt: 0 };
    const fields: Record<string, string | number> = {
      RespondType: 'JSON',
      Version: '1.5',
      TimeStamp: Math.floor(Date.now() / 1000),
      MerchantOrderNo: params.orderId,
      Status: params.issueMode === 'scheduled' ? '0' : '1',
      Category: params.category,
      BuyerName: params.buyerName ?? 'Anonymous',
      BuyerEmail: params.buyerEmail ?? '',
      TaxType: taxType,
      TaxRate: taxType === 1 ? 5 : 0,
      Amt: amt,
      TaxAmt: taxAmt,
      TotalAmt: params.totalAmount,
      ...carrierToEzpay(params.carrier),
      ...itemsToFields(params.items),
    };
    if (params.buyerAddress) fields.BuyerAddress = params.buyerAddress;
    if (params.buyerPhone) fields.BuyerPhone = params.buyerPhone;
    if (params.scheduledAt) fields.CreateStatusTime = params.scheduledAt.slice(0, 10);

    const json = await this.post(ENDPOINTS[this.config.env].issue, fields);
    const result = parseResult(json);
    return {
      invoiceId: result.InvoiceTransNo ?? '',
      invoiceNumber: result.InvoiceNumber ?? '',
      issuedAt: result.CreateTime ?? new Date().toISOString(),
      status: json.Status === 'SUCCESS' ? 'issued' : 'pending',
      totalAmount: Number(result.TotalAmt ?? params.totalAmount),
      raw: json,
    };
  }

  async issueAllowance(
    params: IssueAllowanceParams,
  ): Promise<AllowanceResult> {
    const fields: Record<string, string | number> = {
      RespondType: 'JSON',
      Version: '1.3',
      TimeStamp: Math.floor(Date.now() / 1000),
      InvoiceNo: params.invoiceId,
      MerchantOrderNo: params.invoiceId,
      Status: '1',
      TaxTypeForMixed: 1,
      ...itemsToFields(params.items),
      TotalAmt: params.amount,
    };
    const json = await this.post(ENDPOINTS[this.config.env].allowance, fields);
    const result = parseResult(json);
    return {
      allowanceId: result.AllowanceNo ?? '',
      allowanceNumber: result.AllowanceNo ?? '',
      invoiceId: params.invoiceId,
      amount: params.amount,
      status: json.Status === 'SUCCESS' ? 'issued' : 'failed',
      raw: json,
    };
  }

  async void(params: VoidInvoiceParams): Promise<void> {
    await this.post(ENDPOINTS[this.config.env].void, {
      RespondType: 'JSON',
      Version: '1.0',
      TimeStamp: Math.floor(Date.now() / 1000),
      InvoiceNumber: params.invoiceId,
      InvalidReason: params.reason,
    });
  }

  async query(invoiceNumber: string): Promise<InvoiceResult | null> {
    const json = await this.post(ENDPOINTS[this.config.env].query, {
      RespondType: 'JSON',
      Version: '1.3',
      TimeStamp: Math.floor(Date.now() / 1000),
      SearchType: '0',
      MerchantOrderNo: invoiceNumber,
      TotalAmt: 0,
    });
    if (json.Status !== 'SUCCESS') return null;
    const result = parseResult(json);
    return {
      invoiceId: result.InvoiceTransNo ?? invoiceNumber,
      invoiceNumber: result.InvoiceNumber ?? invoiceNumber,
      issuedAt: result.CreateTime ?? new Date().toISOString(),
      status: 'issued',
      totalAmount: Number(result.TotalAmt ?? 0),
      raw: json,
    };
  }

  /** 統一 POST：把 fields 轉成 PostData_ + MerchantID_ 並打 API。 */
  private async post(
    url: string,
    fields: Record<string, string | number>,
  ): Promise<{ Status?: string; Message?: string; Result?: string }> {
    const postData = aesEncrypt(
      toQueryString(fields),
      this.config.hashKey,
      this.config.hashIv,
    );
    const body = new URLSearchParams({
      MerchantID_: this.config.merchantId,
      PostData_: postData,
    });
    const fetchImpl = this.config.fetchImpl ?? fetch;
    const res = await fetchImpl(url, {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return (await res.json()) as {
      Status?: string;
      Message?: string;
      Result?: string;
    };
  }

  /** 解密 webhook（ezPay 加密 callback，與 issue 同 key）。 */
  decryptCallback(cipherHex: string): Record<string, string> {
    return fromQueryString(
      aesDecrypt(cipherHex, this.config.hashKey, this.config.hashIv),
    );
  }
}

/** ezPay Result 為 JSON string，需再 parse 一次。 */
function parseResult(json: { Result?: string }): Record<string, string> {
  if (!json.Result) return {};
  try {
    return JSON.parse(json.Result) as Record<string, string>;
  } catch {
    return {};
  }
}
