import { describe, expect, it, vi } from 'vitest';

import {
  MetaCapiProvider,
  MultiProviderAnalyticsService,
  hashEmail,
  hashPhone,
} from './index.js';

import type { AnalyticsProvider } from './index.js';

function makeProvider(id: 'ga4' | 'meta-pixel'): AnalyticsProvider {
  return {
    id,
    track: vi.fn(() => Promise.resolve({ provider: id, ok: true })),
    identify: vi.fn(() => Promise.resolve({ provider: id, ok: true })),
  };
}

describe('MultiProviderAnalyticsService', () => {
  it('trackPurchase 推所有 provider', async () => {
    const ga4 = makeProvider('ga4');
    const meta = makeProvider('meta-pixel');
    const svc = new MultiProviderAnalyticsService({ providers: [ga4, meta] });

    const results = await svc.trackPurchase({
      orderId: 'O-1',
      value: 1000,
      currency: 'TWD',
      items: [{ id: 'P-1', quantity: 2, price: 500 }],
    });
    expect(results.length).toBe(2);
    expect(results.every((r) => r.ok)).toBe(true);
    expect(ga4.track).toHaveBeenCalledOnce();
    expect(meta.track).toHaveBeenCalledOnce();
  });

  it('其中一個 provider throw 不會影響其他', async () => {
    const ok = makeProvider('ga4');
    const broken: AnalyticsProvider = {
      id: 'meta-pixel',
      track: () => Promise.reject(new Error('fbq missing')),
      identify: () => Promise.resolve({ provider: 'meta-pixel', ok: true }),
    };
    const svc = new MultiProviderAnalyticsService({
      providers: [ok, broken],
    });
    const results = await svc.trackEvent({ name: 'PageView' });
    expect(results[0]?.ok).toBe(true);
    expect(results[1]?.ok).toBe(false);
    expect(results[1]?.error).toBe('fbq missing');
  });
});

describe('hashing', () => {
  it('hashEmail lowercase + trim', () => {
    expect(hashEmail('  A@B.com ')).toBe(hashEmail('a@b.com'));
  });

  it('hashPhone 去除非數字', () => {
    expect(hashPhone('+886-912-345-678')).toBe(hashPhone('886912345678'));
  });
});

describe('MetaCapiProvider', () => {
  it('呼叫 graph.facebook.com 並雜湊 PII', async () => {
    const fetchSpy = vi.fn(
      async () =>
        new Response(JSON.stringify({ events_received: 1 }), { status: 200 }),
    );
    const capi = new MetaCapiProvider({
      pixelId: '123',
      accessToken: 'tok',
      fetchImpl: fetchSpy,
    });
    const res = await capi.track({
      name: 'Purchase',
      params: { value: 100, currency: 'TWD' },
      context: { email: 'a@b.com', phone: '+886912345678', eventId: 'evt-1' },
    });
    expect(res.ok).toBe(true);
    expect(fetchSpy).toHaveBeenCalledOnce();
    const call = fetchSpy.mock.calls[0] as unknown as [string, RequestInit];
    expect(call[0]).toContain('/123/events');
    const body = JSON.parse(call[1].body as string) as {
      data: Array<{ user_data: { em: string[]; ph: string[] } }>;
    };
    expect(body.data[0]!.user_data.em[0]).toBe(hashEmail('a@b.com'));
    expect(body.data[0]!.user_data.ph[0]).toBe(hashPhone('+886912345678'));
  });

  it('HTTP 失敗回 ok=false', async () => {
    const fetchSpy = vi.fn(async () => new Response('', { status: 500 }));
    const capi = new MetaCapiProvider({
      pixelId: '123',
      accessToken: 'tok',
      fetchImpl: fetchSpy,
    });
    const res = await capi.track({ name: 'PageView' });
    expect(res.ok).toBe(false);
    expect(res.error).toBe('HTTP 500');
  });
});
