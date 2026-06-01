import { hashEmail, hashPhone } from './hashing.js';

import type {
  AnalyticsEvent,
  AnalyticsProvider,
  ProviderDispatchResult,
  ProviderId,
} from './types.js';

/**
 * 通用 dataLayer / window.fbq stub。
 *
 * Client-side providers 真正的整合在 apps 端的 `<head>` script。
 * 此 package 只負責「呼叫對的全域函數」並回 result，未來換 SDK 也只動這層。
 */
function getWindow(): {
  dataLayer?: Array<Record<string, unknown>>;
  fbq?: (...args: unknown[]) => void;
  ttq?: { track: (name: string, params?: unknown) => void };
  _lt?: (...args: unknown[]) => void;
} | null {
  return typeof globalThis !== 'undefined' && 'window' in globalThis
    ? (globalThis as unknown as { window: ReturnType<typeof getWindow> }).window
    : null;
}

function ok(provider: ProviderId): ProviderDispatchResult {
  return { provider, ok: true };
}

function failed(provider: ProviderId, error: string): ProviderDispatchResult {
  return { provider, ok: false, error };
}

/**
 * GA4：透過 GTM dataLayer push。
 */
export class Ga4Provider implements AnalyticsProvider {
  id: ProviderId = 'ga4';

  track(event: AnalyticsEvent): Promise<ProviderDispatchResult> {
    const win = getWindow();
    if (!win) return Promise.resolve(failed('ga4', 'no window'));
    win.dataLayer ??= [];
    win.dataLayer.push({ event: event.name, ...(event.params ?? {}) });
    return Promise.resolve(ok('ga4'));
  }

  identify(
    userId: string,
    traits: Record<string, unknown>,
  ): Promise<ProviderDispatchResult> {
    const win = getWindow();
    if (!win) return Promise.resolve(failed('ga4', 'no window'));
    win.dataLayer ??= [];
    win.dataLayer.push({ event: 'identify', user_id: userId, ...traits });
    return Promise.resolve(ok('ga4'));
  }
}

/**
 * Meta Pixel：呼叫 `window.fbq('track', ...)`。
 */
export class MetaPixelProvider implements AnalyticsProvider {
  id: ProviderId = 'meta-pixel';

  track(event: AnalyticsEvent): Promise<ProviderDispatchResult> {
    const win = getWindow();
    if (!win?.fbq) return Promise.resolve(failed('meta-pixel', 'no fbq'));
    win.fbq('track', event.name, event.params ?? {}, {
      eventID: event.context?.eventId,
    });
    return Promise.resolve(ok('meta-pixel'));
  }

  identify(
    userId: string,
    traits: Record<string, unknown>,
  ): Promise<ProviderDispatchResult> {
    const win = getWindow();
    if (!win?.fbq) return Promise.resolve(failed('meta-pixel', 'no fbq'));
    win.fbq('init', userId, traits);
    return Promise.resolve(ok('meta-pixel'));
  }
}

/**
 * TikTok Pixel：呼叫 `window.ttq.track`。
 */
export class TikTokProvider implements AnalyticsProvider {
  id: ProviderId = 'tiktok';

  track(event: AnalyticsEvent): Promise<ProviderDispatchResult> {
    const win = getWindow();
    if (!win?.ttq) return Promise.resolve(failed('tiktok', 'no ttq'));
    win.ttq.track(event.name, event.params);
    return Promise.resolve(ok('tiktok'));
  }

  identify(): Promise<ProviderDispatchResult> {
    return Promise.resolve(ok('tiktok'));
  }
}

/**
 * LINE Tag：呼叫 `window._lt`。
 */
export class LineTagProvider implements AnalyticsProvider {
  id: ProviderId = 'line-tag';

  track(event: AnalyticsEvent): Promise<ProviderDispatchResult> {
    const win = getWindow();
    if (!win?._lt) return Promise.resolve(failed('line-tag', 'no _lt'));
    win._lt('send', 'cv', { type: event.name }, event.context?.userId);
    return Promise.resolve(ok('line-tag'));
  }

  identify(): Promise<ProviderDispatchResult> {
    return Promise.resolve(ok('line-tag'));
  }
}

/**
 * GTM dataLayer push（不打事件，純套袋；通常 GA4/Meta/TikTok 都會綁在這層）。
 */
export class GtmProvider implements AnalyticsProvider {
  id: ProviderId = 'gtm';

  track(event: AnalyticsEvent): Promise<ProviderDispatchResult> {
    const win = getWindow();
    if (!win) return Promise.resolve(failed('gtm', 'no window'));
    win.dataLayer ??= [];
    win.dataLayer.push({ event: event.name, ...(event.params ?? {}) });
    return Promise.resolve(ok('gtm'));
  }

  identify(
    userId: string,
    traits: Record<string, unknown>,
  ): Promise<ProviderDispatchResult> {
    const win = getWindow();
    if (!win) return Promise.resolve(failed('gtm', 'no window'));
    win.dataLayer ??= [];
    win.dataLayer.push({ event: 'identify', user_id: userId, ...traits });
    return Promise.resolve(ok('gtm'));
  }
}

export interface MetaCapiConfig {
  pixelId: string;
  accessToken: string;
  /** test event code（debug 用） */
  testEventCode?: string;
  /** 自訂 fetch（test 注入） */
  fetchImpl?: typeof fetch;
}

/**
 * Meta Conversion API：server-side HTTP 呼叫。
 *
 * iOS 14+ 後 client-side pixel 損失嚴重；server-side 事件保留率高。Purchase 等
 * 關鍵事件必須同時送 client（pixel）+ server（CAPI），用 eventId dedupe。
 */
export class MetaCapiProvider implements AnalyticsProvider {
  id: ProviderId = 'meta-capi';

  constructor(private readonly config: MetaCapiConfig) {}

  async track(event: AnalyticsEvent): Promise<ProviderDispatchResult> {
    const ctx = event.context ?? {};
    const userData: Record<string, string | string[]> = {};
    if (ctx.email) userData.em = [hashEmail(ctx.email)];
    if (ctx.phone) userData.ph = [hashPhone(ctx.phone)];
    if (ctx.clientId) userData.fbc = ctx.clientId;
    if (ctx.ip) userData.client_ip_address = ctx.ip;
    if (ctx.userAgent) userData.client_user_agent = ctx.userAgent;

    const payload = {
      data: [
        {
          event_name: event.name,
          event_time: Math.floor((ctx.eventTime ?? Date.now()) / 1000),
          event_id: ctx.eventId,
          event_source_url: ctx.sourceUrl,
          action_source: 'website',
          user_data: userData,
          custom_data: event.params ?? {},
        },
      ],
      test_event_code: this.config.testEventCode,
    };

    const fetchFn = this.config.fetchImpl ?? fetch;
    try {
      const res = await fetchFn(
        `https://graph.facebook.com/v18.0/${this.config.pixelId}/events?access_token=${this.config.accessToken}`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) {
        return failed('meta-capi', `HTTP ${res.status}`);
      }
      return ok('meta-capi');
    } catch (err) {
      return failed(
        'meta-capi',
        err instanceof Error ? err.message : String(err),
      );
    }
  }

  identify(): Promise<ProviderDispatchResult> {
    return Promise.resolve(ok('meta-capi'));
  }
}
