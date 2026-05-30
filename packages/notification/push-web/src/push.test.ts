import { describe, expect, it, vi } from 'vitest';

import { WebPushDispatcher } from './dispatcher.js';
import { InMemorySubscriptionStore } from './in-memory-store.js';

import type { WebPushSender, WebPushSubscription } from './types.js';

const VAPID = {
  subject: 'mailto:ops@example.com',
  publicKey: 'pub',
  privateKey: 'priv',
};

const SUB: WebPushSubscription = {
  endpoint: 'https://fcm.googleapis.com/fcm/send/X',
  keys: { p256dh: 'p', auth: 'a' },
};

const PROFILE = {
  userId: 'U-1',
  consent: { email: true, sms: true, line: true, push: true },
};

const PAYLOAD = {
  userId: 'U-1',
  channels: ['push' as const],
  templateId: 'order.shipped',
  category: 'transactional' as const,
  data: { orderId: 'O-1' },
};

const RENDERER = (id: string, data: Record<string, unknown>) => ({
  title: id,
  body: String(data.orderId ?? ''),
});

describe('WebPushDispatcher', () => {
  it('無 subscription → skipped', async () => {
    const store = new InMemorySubscriptionStore();
    const sender: WebPushSender = vi.fn();
    const d = new WebPushDispatcher({ vapid: VAPID, store, renderer: RENDERER, sender });
    const r = await d.dispatch(PAYLOAD, PROFILE);
    expect(r.status).toBe('skipped');
    expect(sender).not.toHaveBeenCalled();
  });

  it('一個 subscription 成功 → sent', async () => {
    const store = new InMemorySubscriptionStore();
    store.add('U-1', SUB);
    const sender: WebPushSender = vi.fn(async () => ({ statusCode: 201 }));
    const d = new WebPushDispatcher({ vapid: VAPID, store, renderer: RENDERER, sender });
    const r = await d.dispatch(PAYLOAD, PROFILE);
    expect(r.status).toBe('sent');
    expect(sender).toHaveBeenCalledOnce();
  });

  it('410 Gone → 從 store 移除', async () => {
    const store = new InMemorySubscriptionStore();
    store.add('U-1', SUB);
    const sender: WebPushSender = vi.fn(async () => ({ statusCode: 410 }));
    const d = new WebPushDispatcher({ vapid: VAPID, store, renderer: RENDERER, sender });
    const r = await d.dispatch(PAYLOAD, PROFILE);
    expect(r.status).toBe('failed');
    expect(store.listByUser('U-1')).toHaveLength(0);
  });

  it('全部失敗 → failed', async () => {
    const store = new InMemorySubscriptionStore();
    store.add('U-1', SUB);
    const sender: WebPushSender = vi.fn(async () => ({ statusCode: 500 }));
    const d = new WebPushDispatcher({ vapid: VAPID, store, renderer: RENDERER, sender });
    const r = await d.dispatch(PAYLOAD, PROFILE);
    expect(r.status).toBe('failed');
  });

  it('多裝置：一裝置成功即視為 sent', async () => {
    const store = new InMemorySubscriptionStore();
    store.add('U-1', SUB);
    store.add('U-1', { ...SUB, endpoint: SUB.endpoint + '/2' });
    const sender: WebPushSender = vi.fn(async (sub) =>
      sub.endpoint.endsWith('/2')
        ? { statusCode: 201 }
        : { statusCode: 500 },
    );
    const d = new WebPushDispatcher({ vapid: VAPID, store, renderer: RENDERER, sender });
    const r = await d.dispatch(PAYLOAD, PROFILE);
    expect(r.status).toBe('sent');
  });
});
