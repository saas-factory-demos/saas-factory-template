import { describe, expect, it } from 'vitest';

import {
  InMemoryNotificationStore,
  NotificationCenter,
} from './index.js';

import type {
  ChannelDispatcher,
  NotificationChannel,
  UserNotificationProfile,
} from './index.js';

function makeDispatcher(channel: NotificationChannel): ChannelDispatcher {
  return {
    channel,
    dispatch() {
      return Promise.resolve({ channel, status: 'sent' as const });
    },
  };
}

const profile: UserNotificationProfile = {
  userId: 'u1',
  consent: { email: true, sms: false, line: true, push: false },
  preferences: { push: true },
};

function newCenter() {
  const store = new InMemoryNotificationStore();
  return {
    store,
    center: new NotificationCenter({
      dispatchers: [
        makeDispatcher('email'),
        makeDispatcher('sms'),
        makeDispatcher('line'),
        makeDispatcher('push'),
        makeDispatcher('in-app'),
      ],
      store,
      profileResolver: { get: () => Promise.resolve(profile) },
      idGenerator: () => 'id-fixed',
    }),
  };
}

describe('NotificationCenter', () => {
  it('transactional 全送', async () => {
    const { center } = newCenter();
    const results = await center.send({
      userId: 'u1',
      channels: ['email', 'sms'],
      templateId: 'order-confirmed',
      category: 'transactional',
      data: {},
    });
    expect(results.every((r) => r.status === 'sent')).toBe(true);
  });

  it('marketing 跳過沒 consent 的 sms', async () => {
    const { center } = newCenter();
    const results = await center.send({
      userId: 'u1',
      channels: ['email', 'sms'],
      templateId: 'promo',
      category: 'marketing',
      data: {},
    });
    const sms = results.find((r) => r.channel === 'sms');
    expect(sms?.status).toBe('skipped');
    expect(sms?.reason).toBe('no marketing consent');
    const email = results.find((r) => r.channel === 'email');
    expect(email?.status).toBe('sent');
  });

  it('security 不受 marketing consent / preferences 影響', async () => {
    const { center } = newCenter();
    const results = await center.send({
      userId: 'u1',
      channels: ['sms'],
      templateId: 'login-alert',
      category: 'security',
      data: {},
    });
    expect(results[0]?.status).toBe('sent');
  });

  it('dedupe window 內第二次 skipped', async () => {
    const { center, store } = newCenter();
    await center.send({
      userId: 'u1',
      channels: ['email'],
      templateId: 'order-shipped',
      category: 'transactional',
      data: {},
    });
    const second = await center.send({
      userId: 'u1',
      channels: ['email'],
      templateId: 'order-shipped',
      category: 'transactional',
      data: {},
      dedupeWindowMs: 60_000,
    });
    expect(second[0]?.status).toBe('skipped');
    expect(second[0]?.reason).toBe('deduped');
    expect(store.all().length).toBe(2);
  });

  it('getUnread / markRead', async () => {
    const { center } = newCenter();
    await center.send({
      userId: 'u1',
      channels: ['in-app'],
      templateId: 'support-reply',
      category: 'transactional',
      data: {},
    });
    const unread = await center.getUnread('u1');
    expect(unread.length).toBe(1);
    await center.markRead(unread[0]!.id);
    const after = await center.getUnread('u1');
    expect(after.length).toBe(0);
  });
});
