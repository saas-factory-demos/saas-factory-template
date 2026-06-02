import { describe, expect, it, vi } from 'vitest';

import { ShippingRouter } from './router.js';

import type {
  ShipmentResult,
  ShippingProvider,
  TrackingInfo,
} from './types.js';

function fakeProvider(name: ShippingProvider['name']): ShippingProvider {
  return {
    name,
    supportedMethods: ['home-delivery'],
    calculateFee: vi.fn(async () => 100),
    createShipment: vi.fn(
      async (): Promise<ShipmentResult> => ({
        shipmentId: 'SP-1',
        trackingNumber: `${name}-T-1`,
        provider: name,
        status: 'pending',
        fee: 100,
        raw: {},
      }),
    ),
    cancelShipment: vi.fn(async () => undefined),
    trackShipment: vi.fn(
      async (): Promise<TrackingInfo> => ({
        trackingNumber: 'T',
        status: 'in-transit',
        events: [],
        raw: {},
      }),
    ),
    parseWebhook: vi.fn(async () => ({
      provider: name,
      trackingNumber: 'T',
      status: 'in-transit' as const,
      occurredAt: '2026-05-15T00:00:00Z',
      raw: {},
      signatureValid: true,
    })),
  };
}

describe('ShippingRouter', () => {
  it('依 defaults 路由', async () => {
    const black = fakeProvider('blackcat');
    const hct = fakeProvider('hct');
    const router = new ShippingRouter([black, hct], {
      defaults: { 'home-delivery': 'blackcat' },
    });
    const r = await router.createShipment({
      tenantId: 't1',
      orderId: 'O',
      method: 'home-delivery',
      sender: { name: 's', phone: '1' },
      receiver: { name: 'r', phone: '2' },
      pkg: { weightGrams: 1000 },
    });
    expect(r.trackingNumber).toBe('blackcat-T-1');
  });

  it('tenant override 優先', async () => {
    const black = fakeProvider('blackcat');
    const hct = fakeProvider('hct');
    const router = new ShippingRouter([black, hct], {
      defaults: { 'home-delivery': 'blackcat' },
      overrides: { 't2': { 'home-delivery': 'hct' } },
    });
    const r = await router.createShipment({
      tenantId: 't2',
      orderId: 'O',
      method: 'home-delivery',
      sender: { name: 's', phone: '1' },
      receiver: { name: 'r', phone: '2' },
      pkg: { weightGrams: 1000 },
    });
    expect(r.trackingNumber).toBe('hct-T-1');
  });

  it('無 routing → throw', () => {
    const router = new ShippingRouter([fakeProvider('blackcat')], { defaults: {} });
    expect(() => router.resolve('t', 'home-delivery')).toThrow();
  });
});
