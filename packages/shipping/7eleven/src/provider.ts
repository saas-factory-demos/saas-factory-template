/**
 * 7-11 交貨便 Provider（含取貨付款）。v1 stub。
 *
 * 7-11 物流通常透過綠界 LogisticsType=CVS + LogisticsSubType=UNIMART / UNIMARTC2C 介接，
 * 或直接走統一 OpenPoint API。本 stub 採綠界 CheckMacValue 同款簽章（小寫 URLEncode + SHA256）。
 *
 * Lock：ADR-0011 §02-02 v1 stub。
 */

import { createHash } from 'node:crypto';

import type {
  CalculateFeeParams,
  CreateShipmentParams,
  ShipmentResult,
  ShippingMethod,
  ShippingProvider,
  ShippingWebhookEvent,
  TrackingInfo,
} from '@saas-factory/shipping-core';

export interface SevenElevenConfig {
  merchantId: string;
  hashKey: string;
  hashIv: string;
  env: 'sandbox' | 'production';
  fetchImpl?: typeof fetch;
}

const SUPPORTED: readonly ShippingMethod[] = ['cvs-pickup', 'cvs-pickup-cod'];

const URL_ENC_MAP: Array<[RegExp, string]> = [
  [/!/g, '%21'],
  [/\*/g, '%2a'],
  [/\(/g, '%28'],
  [/\)/g, '%29'],
];

/** 綠界式 URL encode（escape sequence 小寫）。 */
function ecpayUrlEncode(value: string): string {
  let encoded = encodeURIComponent(value);
  for (const [from, to] of URL_ENC_MAP) encoded = encoded.replace(from, to);
  return encoded.toLowerCase();
}

/**
 * 綠界物流 CheckMacValue：
 *   1. 排序 → HashKey=...&K=V&...&HashIV=...
 *   2. URL encode + 全部小寫 + SHA256 大寫
 */
export function buildLogisticsCheckMacValue(
  params: Record<string, string | number>,
  hashKey: string,
  hashIv: string,
): string {
  const ordered: [string, string][] = Object.entries(params)
    .filter(([k]) => k !== 'CheckMacValue')
    .map(([k, v]) => [k, String(v)]);
  ordered.sort(([a], [b]) => a.localeCompare(b));
  const joined = ordered.map(([k, v]) => `${k}=${v}`).join('&');
  const raw = `HashKey=${hashKey}&${joined}&HashIV=${hashIv}`;
  const encoded = ecpayUrlEncode(raw);
  return createHash('sha256').update(encoded).digest('hex').toUpperCase();
}

export function verifyLogisticsCheckMacValue(
  params: Record<string, string>,
  receivedMac: string,
  hashKey: string,
  hashIv: string,
): boolean {
  const expected = buildLogisticsCheckMacValue(params, hashKey, hashIv);
  return expected === receivedMac.toUpperCase();
}

export class SevenElevenProvider implements ShippingProvider {
  readonly name = '7eleven' as const;
  readonly supportedMethods = SUPPORTED;

  constructor(private readonly config: SevenElevenConfig) {}

  async calculateFee(_p: CalculateFeeParams): Promise<number> {
    throw new Error('7-11 awaiting credentials (ADR-0011 §02-02 stub)');
  }
  async createShipment(_p: CreateShipmentParams): Promise<ShipmentResult> {
    throw new Error('7-11 awaiting credentials (ADR-0011 §02-02 stub)');
  }
  async cancelShipment(_t: string): Promise<void> {
    throw new Error('7-11 awaiting credentials (ADR-0011 §02-02 stub)');
  }
  async trackShipment(_t: string): Promise<TrackingInfo> {
    throw new Error('7-11 awaiting credentials (ADR-0011 §02-02 stub)');
  }

  async parseWebhook(
    rawBody: string,
    _headers: Record<string, string>,
  ): Promise<ShippingWebhookEvent> {
    // 綠界物流 callback 是 form-urlencoded
    const body = parseForm(rawBody);
    const mac = body.CheckMacValue;
    if (!mac) {
      return invalid('7eleven', rawBody, 'missing CheckMacValue');
    }
    const fields = { ...body };
    delete fields.CheckMacValue;
    if (
      !verifyLogisticsCheckMacValue(
        fields,
        mac,
        this.config.hashKey,
        this.config.hashIv,
      )
    ) {
      return invalid('7eleven', rawBody, 'CheckMacValue mismatch');
    }
    return {
      provider: '7eleven',
      trackingNumber: body.AllPayLogisticsID ?? body.LogisticsID ?? '',
      orderId: body.MerchantTradeNo,
      status: mapEcpayLogisticsStatus(body.RtnCode ?? ''),
      occurredAt: new Date().toISOString(),
      raw: body,
      signatureValid: true,
    };
  }
}

function parseForm(qs: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const pair of qs.split('&')) {
    if (!pair) continue;
    const idx = pair.indexOf('=');
    const k = idx === -1 ? pair : pair.slice(0, idx);
    const v = idx === -1 ? '' : pair.slice(idx + 1);
    out[decodeURIComponent(k)] = decodeURIComponent(v.replace(/\+/g, ' '));
  }
  return out;
}

/** 綠界物流 RtnCode 對映到 ShipmentStatus。 */
export function mapEcpayLogisticsStatus(
  code: string,
): ShippingWebhookEvent['status'] {
  const m: Record<string, ShippingWebhookEvent['status']> = {
    '300': 'pending', // 已建單
    '2030': 'in-transit', // 運送中
    '2068': 'in-transit',
    '2067': 'arrived', // 到店
    '3022': 'delivered', // 取件
    '3018': 'returned', // 退回
  };
  return m[code] ?? 'pending';
}

function invalid(
  provider: ShippingProvider['name'],
  rawBody: string,
  reason: string,
): ShippingWebhookEvent {
  return {
    provider,
    trackingNumber: '',
    status: 'pending',
    occurredAt: new Date().toISOString(),
    raw: { rawBody, reason },
    signatureValid: false,
    error: reason,
  };
}
