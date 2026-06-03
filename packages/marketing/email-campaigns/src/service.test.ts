import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  InMemoryCampaignStore,
  InMemoryEmailEventStore,
  InMemorySendStore,
  InMemoryUnsubscribeStore,
} from './in-memory-store.js';
import { EmailCampaignService, type SegmentResolver } from './service.js';

import type { EmailCampaign, EmailSenderHandler, FrequencyPolicy } from './types.js';

describe('EmailCampaignService', () => {
  let campaigns: InMemoryCampaignStore;
  let sends: InMemorySendStore;
  let events: InMemoryEmailEventStore;
  let unsubs: InMemoryUnsubscribeStore;
  let service: EmailCampaignService;
  let sender: { send: ReturnType<typeof vi.fn<EmailSenderHandler['send']>> };
  let resolveSegment: ReturnType<typeof vi.fn<SegmentResolver>>;
  let counter = 0;
  const now = new Date('2026-05-15T00:00:00Z');
  const policy: FrequencyPolicy = { windowHours: 24, maxEmailsInWindow: 2 };

  const baseDraft: Omit<EmailCampaign, 'id' | 'status' | 'createdAt'> = {
    tenantId: 't1',
    name: '5 月電子報',
    subject: '夏季開跑',
    bodyHtml: '<p>hi</p>',
    bodyText: 'hi',
    fromEmail: 'no-reply@shop.tw',
    fromName: 'Shop',
    segmentId: 'seg1',
    scheduledAt: new Date(now.getTime() - 1000),
  };

  beforeEach(() => {
    campaigns = new InMemoryCampaignStore();
    sends = new InMemorySendStore();
    events = new InMemoryEmailEventStore();
    unsubs = new InMemoryUnsubscribeStore();
    sender = {
      send: vi.fn<EmailSenderHandler['send']>(async () => ({ ok: true, providerMessageId: 'msg' })),
    };
    resolveSegment = vi.fn<SegmentResolver>(async () => [
      { customerId: 'c1', email: 'a@x' },
      { customerId: 'c2', email: 'b@x' },
      { customerId: 'c3', email: 'c@x' },
    ]);
    counter = 0;
    service = new EmailCampaignService(
      campaigns,
      sends,
      events,
      unsubs,
      { sender, resolveSegment },
      policy,
      { now: () => now, genId: () => `id_${++counter}` },
    );
  });

  it('schedule / cancel 狀態轉換', async () => {
    const c = await service.create(baseDraft);
    expect(c.status).toBe('draft');
    const scheduled = await service.schedule(c.id);
    expect(scheduled.status).toBe('scheduled');
    const cancelled = await service.cancel(c.id);
    expect(cancelled.status).toBe('cancelled');
    await expect(service.schedule(c.id)).rejects.toThrow('狀態錯誤');
  });

  it('dispatchDue 寄出對 3 人', async () => {
    const c = await service.create(baseDraft);
    await service.schedule(c.id);
    const ran = await service.dispatchDue('t1');
    expect(ran).toHaveLength(1);
    expect(ran[0]?.status).toBe('sent');
    expect(sender.send).toHaveBeenCalledTimes(3);
    const all = await sends.listByCampaign(c.id);
    expect(all.filter((s) => s.status === 'sent')).toHaveLength(3);
  });

  it('退訂者 skip', async () => {
    await service.unsubscribe({ tenantId: 't1', email: 'a@x' });
    const c = await service.create(baseDraft);
    await service.schedule(c.id);
    await service.dispatchDue('t1');
    const list = await sends.listByCampaign(c.id);
    const aSend = list.find((s) => s.toEmail === 'a@x');
    expect(aSend?.status).toBe('skipped');
    expect(aSend?.skipReason).toBe('unsubscribed');
    expect(sender.send).toHaveBeenCalledTimes(2);
  });

  it('頻率上限 skip（同 email 24 小時內 >2 封）', async () => {
    // 先建並寄 2 封給 a@x
    const c1 = await service.create({ ...baseDraft, name: 'c1' });
    await service.schedule(c1.id);
    await service.dispatchDue('t1');
    const c2 = await service.create({ ...baseDraft, name: 'c2' });
    await service.schedule(c2.id);
    await service.dispatchDue('t1');
    // 第三封應該全 skip 因為 maxEmailsInWindow=2
    const c3 = await service.create({ ...baseDraft, name: 'c3' });
    await service.schedule(c3.id);
    await service.dispatchDue('t1');
    const list = await sends.listByCampaign(c3.id);
    expect(list.every((s) => s.status === 'skipped' && s.skipReason === 'frequency-cap')).toBe(true);
  });

  it('stats 計算開信 / 點擊 / 退訂率', async () => {
    const c = await service.create(baseDraft);
    await service.schedule(c.id);
    await service.dispatchDue('t1');
    const list = await sends.listByCampaign(c.id);
    await service.recordProviderEvent(list[0]!.id, 'delivered', now);
    await service.recordProviderEvent(list[0]!.id, 'opened', now);
    await service.recordProviderEvent(list[0]!.id, 'opened', now); // 重複算 1
    await service.recordProviderEvent(list[0]!.id, 'clicked', now, 'http://x');
    await service.recordProviderEvent(list[1]!.id, 'opened', now);
    await service.recordProviderEvent(list[2]!.id, 'bounced', now);
    // bounced 後 send.status 改 'bounced'，所以 sent=2
    const s = await service.stats(c.id);
    expect(s.sent).toBe(2);
    expect(s.opened).toBe(2);
    expect(s.clicked).toBe(1);
    expect(s.bounced).toBe(1);
    expect(s.openRate).toBeCloseTo(1);
    expect(s.clickRate).toBeCloseTo(0.5);
  });
});
