/**
 * 全家店到店 Provider（含取貨付款）。v1 stub。
 *
 * 與 7-11 共用綠界物流 CheckMacValue 簽章（LogisticsSubType=FAMI / FAMIC2C）。
 *
 * Lock：ADR-0011 §02-02 v1 stub。
 */

import {
  buildLogisticsCheckMacValue,
  mapEcpayLogisticsStatus,
  verifyLogisticsCheckMacValue,
} from '@saas-factory/shipping-7eleven';

import type {
  CalculateFeeParams,
  CreateShipmentParams,
  ShipmentResult,
  ShippingMethod,
  ShippingProvider,
  ShippingWebhookEvent,
  TrackingInfo,
} from '@saas-factory/shipping-core';

export interface FamilyMartConfig {
  merchantId: string;
  hashKey: string;
  hashIv: string;
  env: 'sandbox' | 'production';
  fetchImpl?: typeof fetch;
}

const SUPPORTED: readonly ShippingMethod[] = ['cvs-pickup', 'cvs-pickup-cod'];

/** 對外 re-export 給 webhook router 用。 */
export { buildLogisticsCheckMacValue, verifyLogisticsCheckMacValue };

export class FamilyMartProvider implements ShippingProvider {
  readonly name = 'family-mart' as const;
  readonly supportedMethods = SUPPORTED;

  constructor(private readonly config: FamilyMartConfig) {}

  async calculateFee(_p: CalculateFeeParams): Promise<number> {
    throw new Error('FamilyMart awaiting credentials (ADR-0011 §02-02 stub)');
  }
  async createShipment(_p: CreateShipmentParams): Promise<ShipmentResult> {
    throw new Error('FamilyMart awaiting credentials (ADR-0011 §02-02 stub)');
  }
  async cancelShipment(_t: string): Promise<void> {
    throw new Error('FamilyMart awaiting credentials (ADR-0011 §02-02 stub)');
  }
  async trackShipment(_t: string): Promise<TrackingInfo> {
    throw new Error('FamilyMart awaiting credentials (ADR-0011 §02-02 stub)');
  }

  async parseWebhook(
    rawBody: string,
    _headers: Record<string, string>,
  ): Promise<ShippingWebhookEvent> {
    const body = parseForm(rawBody);
    const mac = body.CheckMacValue;
    if (!mac) return invalid(rawBody, 'missing CheckMacValue');
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
      return invalid(rawBody, 'CheckMacValue mismatch');
    }
    return {
      provider: 'family-mart',
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

function invalid(rawBody: string, reason: string): ShippingWebhookEvent {
  return {
    provider: 'family-mart',
    trackingNumber: '',
    status: 'pending',
    occurredAt: new Date().toISOString(),
    raw: { rawBody, reason },
    signatureValid: false,
    error: reason,
  };
}
