import { describe, expect, it, vi } from 'vitest';

import { LineMessagingDispatcher } from './dispatcher.js';
import { orderUpdateFlex } from './flex-templates.js';

import type { LineMessage } from './types.js';

const PROFILE = { userId: 'U-1', consent: { email: true, sms: true, line: true, push: true } };

const PAYLOAD = {
  userId: 'U-1',
  channels: ['line' as const],
  templateId: 'order.shipped',
  category: 'transactional' as const,
  data: { orderId: 'O-1' },
};

describe('LineMessagingDispatcher', () => {
  it('renderer 回傳訊息 → push 成功', async () => {
    const fakeFetch = vi.fn(async () => new Response('{}', { status: 200 }));
    const dispatcher = new LineMessagingDispatcher({
      channelAccessToken: 'tok',
      fetchImpl: fakeFetch,
      renderer: (id, data): LineMessage[] => [
        { type: 'text', text: `${id} ${String(data.orderId ?? '')}` },
      ],
    });
    const r = await dispatcher.dispatch(PAYLOAD, PROFILE);
    expect(r.status).toBe('sent');
    expect(fakeFetch).toHaveBeenCalledOnce();
    const call = fakeFetch.mock.calls[0] as unknown as [string];
    expect(call[0]).toContain('/v2/bot/message/push');
  });

  it('renderer 回傳空陣列 → skipped', async () => {
    const dispatcher = new LineMessagingDispatcher({
      channelAccessToken: 'tok',
      fetchImpl: vi.fn(),
      renderer: () => [],
    });
    const r = await dispatcher.dispatch(PAYLOAD, PROFILE);
    expect(r.status).toBe('skipped');
  });

  it('API 4xx → failed', async () => {
    const fakeFetch: typeof fetch = async () =>
      new Response('{"message":"Invalid token"}', { status: 401 });
    const dispatcher = new LineMessagingDispatcher({
      channelAccessToken: 'bad',
      fetchImpl: fakeFetch,
      renderer: () => [{ type: 'text', text: 'hi' }],
    });
    const r = await dispatcher.dispatch(PAYLOAD, PROFILE);
    expect(r.status).toBe('failed');
    expect(r.reason).toContain('401');
  });

  it('Flex 卡片產生器：訂單', () => {
    const flex = orderUpdateFlex({
      title: '已出貨',
      orderId: 'O-1',
      amount: 1500,
      currency: 'TWD',
      trackingUrl: 'https://shop.test/orders/O-1',
    });
    expect(flex.type).toBe('flex');
    expect(flex.altText).toBe('已出貨');
  });

  it('multicast >500 → throw', async () => {
    const dispatcher = new LineMessagingDispatcher({
      channelAccessToken: 'tok',
      fetchImpl: vi.fn(),
      renderer: () => [],
    });
    await expect(
      dispatcher.multicast(new Array(501).fill('U'), [{ type: 'text', text: 'hi' }]),
    ).rejects.toThrow(/max 500/);
  });
});
