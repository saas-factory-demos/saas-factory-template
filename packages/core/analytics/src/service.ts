import type {
  AnalyticsEvent,
  AnalyticsProvider,
  PageViewParams,
  ProviderDispatchResult,
  PurchaseParams,
} from './types.js';

/**
 * AnalyticsService 介面（goal 01 §5）。
 *
 * 對 apps 端只看到一個 service，由它分發到所有 provider。
 */
export interface AnalyticsService {
  trackEvent(event: AnalyticsEvent): Promise<ProviderDispatchResult[]>;
  trackPageView(params: PageViewParams): Promise<ProviderDispatchResult[]>;
  trackPurchase(params: PurchaseParams): Promise<ProviderDispatchResult[]>;
  identify(
    userId: string,
    traits: Record<string, unknown>,
  ): Promise<ProviderDispatchResult[]>;
}

export interface MultiProviderConfig {
  providers: AnalyticsProvider[];
}

export class MultiProviderAnalyticsService implements AnalyticsService {
  constructor(private readonly config: MultiProviderConfig) {}

  trackEvent(event: AnalyticsEvent): Promise<ProviderDispatchResult[]> {
    return this.dispatchAll((p) => p.track(event));
  }

  trackPageView(params: PageViewParams): Promise<ProviderDispatchResult[]> {
    return this.trackEvent({
      name: 'PageView',
      params: {
        url: params.url,
        title: params.title,
        referrer: params.referrer,
      },
      context: params.context,
    });
  }

  trackPurchase(params: PurchaseParams): Promise<ProviderDispatchResult[]> {
    return this.trackEvent({
      name: 'Purchase',
      params: {
        order_id: params.orderId,
        value: params.value,
        currency: params.currency,
        contents: params.items.map((i) => ({
          id: i.id,
          quantity: i.quantity,
          item_price: i.price,
        })),
        num_items: params.items.reduce((sum, i) => sum + i.quantity, 0),
      },
      context: params.context,
    });
  }

  identify(
    userId: string,
    traits: Record<string, unknown>,
  ): Promise<ProviderDispatchResult[]> {
    return this.dispatchAll((p) => p.identify(userId, traits));
  }

  private async dispatchAll(
    fn: (p: AnalyticsProvider) => Promise<ProviderDispatchResult>,
  ): Promise<ProviderDispatchResult[]> {
    const results = await Promise.allSettled(
      this.config.providers.map((p) => fn(p)),
    );
    return results.map((r, i) =>
      r.status === 'fulfilled'
        ? r.value
        : {
            provider: this.config.providers[i]!.id,
            ok: false,
            error:
              r.reason instanceof Error ? r.reason.message : String(r.reason),
          },
    );
  }
}
