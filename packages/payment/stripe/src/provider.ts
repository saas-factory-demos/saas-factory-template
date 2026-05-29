import { verifyStripeSignature } from './signature.js';

import type {
  ChargeRequest,
  ChargeResult,
  CurrencyCode,
  PaymentMethod,
  PaymentProvider,
  RefundRequest,
  RefundResult,
  SubscriptionRequest,
  SubscriptionResult,
  WebhookEvent,
} from '@saas-factory/payment-core';

export interface StripeConfig {
  secretKey: string;
  webhookSecret: string;
  /** Stripe Price ID 對應表（訂閱用，需先在 Stripe Dashboard 建好） */
  priceIdByOrder?: (orderId: string) => string;
  /** 注入 fetch 用於測試 */
  fetchImpl?: typeof fetch;
  apiVersion?: string;
}

const API_BASE = 'https://api.stripe.com/v1';
const SUPPORTED_METHODS: readonly PaymentMethod[] = ['stripe-card'];

const STRIPE_EVENT_TO_INTERNAL: Record<
  string,
  WebhookEvent['type'] | undefined
> = {
  'checkout.session.completed': 'charge.paid',
  'payment_intent.succeeded': 'charge.paid',
  'payment_intent.payment_failed': 'charge.failed',
  'charge.refunded': 'refund.completed',
  'invoice.paid': 'subscription.charged',
  'invoice.payment_failed': 'subscription.failed',
  'customer.subscription.deleted': 'subscription.cancelled',
};

export class StripeProvider implements PaymentProvider {
  readonly name = 'stripe' as const;
  readonly supportedMethods = SUPPORTED_METHODS;

  constructor(private readonly config: StripeConfig) {}

  private get fetchImpl(): typeof fetch {
    return this.config.fetchImpl ?? fetch;
  }

  private async stripeRequest(
    path: string,
    params: Record<string, string | number>,
  ): Promise<Record<string, unknown>> {
    const body = new URLSearchParams(
      Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
    );
    const res = await this.fetchImpl(`${API_BASE}${path}`, {
      method: 'POST',
      body,
      headers: {
        Authorization: `Bearer ${this.config.secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        ...(this.config.apiVersion
          ? { 'Stripe-Version': this.config.apiVersion }
          : {}),
      },
    });
    return (await res.json()) as Record<string, unknown>;
  }

  async charge(request: ChargeRequest): Promise<ChargeResult> {
    // 建 Checkout Session（hosted）
    const data = await this.stripeRequest('/checkout/sessions', {
      mode: 'payment',
      'payment_method_types[]': 'card',
      'line_items[0][price_data][currency]': request.amount.currency.toLowerCase(),
      'line_items[0][price_data][product_data][name]':
        request.description ?? request.orderId,
      'line_items[0][price_data][unit_amount]': request.amount.amount,
      'line_items[0][quantity]': 1,
      client_reference_id: request.orderId,
      success_url: request.returnUrl ?? '',
      cancel_url: request.cancelUrl ?? '',
    });
    const sessionId = String(data.id ?? '');
    const url = String(data.url ?? '');
    return {
      orderId: request.orderId,
      providerTradeId: sessionId,
      provider: 'stripe',
      method: request.method,
      status: 'pending',
      amount: request.amount,
      redirectUrl: url || undefined,
      raw: data,
    };
  }

  async refund(request: RefundRequest): Promise<RefundResult> {
    const params: Record<string, string | number> = {
      payment_intent: request.providerTradeId,
    };
    if (request.amount) {
      params.amount = request.amount.amount;
    }
    if (request.reason) {
      params.reason = request.reason.startsWith('fraud')
        ? 'fraudulent'
        : 'requested_by_customer';
    }
    const data = await this.stripeRequest('/refunds', params);
    const status = String(data.status ?? '');
    return {
      orderId: request.orderId,
      providerTradeId: request.providerTradeId,
      refundId: String(data.id ?? ''),
      amount: request.amount ?? { amount: 0, currency: 'TWD' },
      status: status === 'succeeded' ? 'refunded' : 'failed',
      raw: data,
    };
  }

  async createSubscription(
    request: SubscriptionRequest,
  ): Promise<SubscriptionResult> {
    const priceId = this.config.priceIdByOrder?.(request.orderId);
    if (!priceId) {
      throw new Error(
        'StripeProvider.createSubscription 需 config.priceIdByOrder 對應 Stripe Price ID',
      );
    }
    const data = await this.stripeRequest('/checkout/sessions', {
      mode: 'subscription',
      'payment_method_types[]': 'card',
      'line_items[0][price]': priceId,
      'line_items[0][quantity]': 1,
      client_reference_id: request.orderId,
      success_url: request.returnUrl ?? '',
      cancel_url: request.notifyUrl ?? '',
    });
    return {
      orderId: request.orderId,
      providerTradeId: String(data.id ?? ''),
      provider: 'stripe',
      subscriptionId: String(data.subscription ?? data.id ?? ''),
      status: 'active',
      redirectUrl: String(data.url ?? '') || undefined,
      raw: data,
    };
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    await this.fetchImpl(`${API_BASE}/subscriptions/${subscriptionId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${this.config.secretKey}` },
    });
  }

  async parseWebhook(
    rawBody: string,
    headers: Record<string, string>,
  ): Promise<WebhookEvent> {
    const sigHeader = headers['stripe-signature'] ?? headers['Stripe-Signature'];
    if (!sigHeader) {
      return invalidEvent(rawBody, 'missing Stripe-Signature header');
    }
    const valid = verifyStripeSignature(
      rawBody,
      sigHeader,
      this.config.webhookSecret,
    );
    if (!valid) {
      return invalidEvent(rawBody, 'signature mismatch');
    }
    let body: Record<string, unknown>;
    try {
      body = JSON.parse(rawBody) as Record<string, unknown>;
    } catch (err) {
      return invalidEvent(rawBody, `invalid JSON: ${String(err)}`);
    }
    const eventId = String(body.id ?? '');
    const eventType = String(body.type ?? '');
    const internalType = STRIPE_EVENT_TO_INTERNAL[eventType];
    if (!internalType) {
      return {
        provider: 'stripe',
        type: 'charge.failed',
        providerTradeId: '',
        raw: body,
        signatureValid: true,
        idempotencyKey: `stripe:${eventId}`,
        occurredAt: new Date().toISOString(),
        error: `unsupported event type: ${eventType}`,
      };
    }
    const dataObject =
      ((body.data as Record<string, unknown> | undefined)?.object as
        | Record<string, unknown>
        | undefined) ?? {};
    const orderId = String(
      dataObject.client_reference_id ??
        dataObject.metadata_order_id ??
        '',
    );
    const providerTradeId = String(dataObject.id ?? '');
    const amount = Number(
      dataObject.amount_total ?? dataObject.amount ?? 0,
    );
    const currency = String(dataObject.currency ?? 'usd').toUpperCase();
    return {
      provider: 'stripe',
      type: internalType,
      orderId,
      providerTradeId,
      amount: amount
        ? { amount, currency: currency as CurrencyCode }
        : undefined,
      raw: body,
      signatureValid: true,
      idempotencyKey: `stripe:${eventId}`,
      occurredAt: new Date().toISOString(),
    };
  }
}

function invalidEvent(rawBody: string, reason: string): WebhookEvent {
  return {
    provider: 'stripe',
    type: 'charge.failed',
    providerTradeId: '',
    raw: { rawBody, reason },
    signatureValid: false,
    idempotencyKey: `stripe:invalid:${Date.now()}`,
    occurredAt: new Date().toISOString(),
    error: reason,
  };
}
