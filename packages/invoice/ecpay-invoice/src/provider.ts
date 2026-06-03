/**
 * 綠界電子發票 B2C v3 Provider。
 *
 * 端點：
 * - sandbox: https://einvoice-stage.ecpay.com.tw/B2CInvoice
 * - production: https://einvoice.ecpay.com.tw/B2CInvoice
 *
 * 載具對應：
 * - `Carrier Type`：'' 無 / '1' 會員載具 / '2' 自然人憑證 / '3' 手機條碼
 * - 統編走 `CustomerIdentifier`
 * - 捐贈走 `Donation=1` + `LoveCode`
 *
 * 規格出處：綠界 B2C 電子發票 API V3 文件。
 */

import { decodeData, encodeData } from './crypto.js';

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

export interface EcpayInvoiceConfig {
  merchantId: string;
  hashKey: string;
  hashIv: string;
  env: 'sandbox' | 'production';
  fetchImpl?: typeof fetch;
}

const BASE: Record<EcpayInvoiceConfig['env'], string> = {
  production: 'https://einvoice.ecpay.com.tw/B2CInvoice',
  sandbox: 'https://einvoice-stage.ecpay.com.tw/B2CInvoice',
};

/** 轉 carrier → ECPay B2C v3 欄位。 */
function carrierToFields(
  carrier: InvoiceCarrier,
): Record<string, string | number> {
  switch (carrier.type) {
    case 'mobile-barcode':
      return { CarrierType: '3', CarrierNum: carrier.value ?? '', Print: '0', Donation: '0' };
    case 'natural-person-cert':
      return { CarrierType: '2', CarrierNum: carrier.value ?? '', Print: '0', Donation: '0' };
    case 'member':
      return { CarrierType: '1', CarrierNum: carrier.value ?? '', Print: '0', Donation: '0' };
    case 'company-tax-id':
      return {
        CustomerIdentifier: carrier.value ?? '',
        Print: '1',
        Donation: '0',
        CarrierType: '',
      };
    case 'donation':
      return {
        Donation: '1',
        LoveCode: carrier.donationCode ?? '',
        Print: '0',
        CarrierType: '',
      };
    case 'paper':
      return { Print: '1', Donation: '0', CarrierType: '' };
    default: {
      const _exhaustive: never = carrier.type;
      throw new Error(`unknown carrier: ${String(_exhaustive)}`);
    }
  }
}

const TAX_TYPE_MAP = {
  taxable: '1',
  'zero-tax': '2',
  'tax-free': '3',
  mixed: '9',
} as const;

function itemsToFields(items: InvoiceItem[]): Record<string, unknown> {
  return {
    Items: items.map((i, idx) => ({
      ItemSeq: idx + 1,
      ItemName: i.name,
      ItemCount: i.quantity,
      ItemWord: i.unit ?? '個',
      ItemPrice: i.unitPrice,
      ItemTaxType: i.taxType ? TAX_TYPE_MAP[i.taxType] : '1',
      ItemAmount: i.quantity * i.unitPrice,
    })),
  };
}

/**
 * 綠界電子發票 Provider。
 */
export class EcpayInvoiceProvider implements InvoiceProvider {
  readonly name = 'ecpay-invoice' as const;

  constructor(private readonly config: EcpayInvoiceConfig) {
    if (config.hashKey.length !== 16 || config.hashIv.length !== 16) {
      throw new Error('ECPay invoice config: HashKey 16 + HashIV 16 必填');
    }
  }

  async issue(params: IssueInvoiceParams): Promise<InvoiceResult> {
    const data = {
      MerchantID: this.config.merchantId,
      RelateNumber: params.orderId,
      CustomerID: '',
      CustomerName: params.buyerName ?? '',
      CustomerAddr: params.buyerAddress ?? '',
      CustomerPhone: params.buyerPhone ?? '',
      CustomerEmail: params.buyerEmail ?? '',
      ClearanceMark: '',
      TaxType: TAX_TYPE_MAP[params.taxType ?? 'taxable'],
      SalesAmount: params.totalAmount,
      InvoiceRemark: '',
      InvType: '07',
      vat: '1',
      ...carrierToFields(params.carrier),
      ...itemsToFields(params.items),
    };
    const json = await this.post('/Issue', data);
    const result = (json.Data ?? {}) as Record<string, unknown>;
    const success = json.TransCode === 1 && result.RtnCode === 1;
    return {
      invoiceId: String(result.InvoiceNo ?? ''),
      invoiceNumber: String(result.InvoiceNo ?? ''),
      issuedAt: String(result.InvoiceDate ?? new Date().toISOString()),
      status: success ? 'issued' : 'pending',
      totalAmount: params.totalAmount,
      raw: json,
    };
  }

  async issueAllowance(
    params: IssueAllowanceParams,
  ): Promise<AllowanceResult> {
    const data = {
      MerchantID: this.config.merchantId,
      InvoiceNo: params.invoiceId,
      InvoiceDate: new Date().toISOString().slice(0, 10),
      AllowanceNotify: 'E',
      CustomerName: '',
      NotifyMail: '',
      AllowanceAmount: params.amount,
      ...itemsToFields(params.items),
    };
    const json = await this.post('/Allowance', data);
    const result = (json.Data ?? {}) as Record<string, unknown>;
    const success = json.TransCode === 1 && result.RtnCode === 1;
    return {
      allowanceId: String(result.IA_Allow_No ?? ''),
      allowanceNumber: String(result.IA_Allow_No ?? ''),
      invoiceId: params.invoiceId,
      amount: params.amount,
      status: success ? 'issued' : 'failed',
      raw: json,
    };
  }

  async void(params: VoidInvoiceParams): Promise<void> {
    await this.post('/Invalid', {
      MerchantID: this.config.merchantId,
      InvoiceNo: params.invoiceId,
      InvoiceDate: new Date().toISOString().slice(0, 10),
      Reason: params.reason,
    });
  }

  async query(invoiceNumber: string): Promise<InvoiceResult | null> {
    const json = await this.post('/GetIssue', {
      MerchantID: this.config.merchantId,
      RelateNumber: invoiceNumber,
    });
    const result = (json.Data ?? {}) as Record<string, unknown>;
    if (json.TransCode !== 1 || result.RtnCode !== 1) return null;
    return {
      invoiceId: String(result.IIS_Number ?? invoiceNumber),
      invoiceNumber: String(result.IIS_Number ?? invoiceNumber),
      issuedAt: String(result.IIS_Create_Date ?? new Date().toISOString()),
      status: 'issued',
      totalAmount: Number(result.IIS_Sales_Amount ?? 0),
      raw: json,
    };
  }

  /** 統一 POST：把 data 加密成 Data，並包入 MerchantID + RqHeader。 */
  private async post(
    path: string,
    data: Record<string, unknown>,
  ): Promise<{ TransCode?: number; TransMsg?: string; Data?: unknown }> {
    const encrypted = encodeData(data, this.config.hashKey, this.config.hashIv);
    const body = JSON.stringify({
      MerchantID: this.config.merchantId,
      RqHeader: { Timestamp: Math.floor(Date.now() / 1000) },
      Data: encrypted,
    });
    const fetchImpl = this.config.fetchImpl ?? fetch;
    const res = await fetchImpl(`${BASE[this.config.env]}${path}`, {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/json' },
    });
    const json = (await res.json()) as {
      TransCode?: number;
      TransMsg?: string;
      Data?: string;
    };
    let decoded: Record<string, unknown> | undefined;
    if (typeof json.Data === 'string' && json.Data.length > 0) {
      try {
        decoded = decodeData(json.Data, this.config.hashKey, this.config.hashIv);
      } catch {
        decoded = undefined;
      }
    }
    return { TransCode: json.TransCode, TransMsg: json.TransMsg, Data: decoded };
  }
}
