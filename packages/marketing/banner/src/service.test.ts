import { beforeEach, describe, expect, it } from 'vitest';

import {
  InMemoryBannerStore,
  InMemoryClickStore,
  InMemoryImpressionStore,
} from './in-memory-store.js';
import { BannerService, filterEligible, inDayWindow, pickWeighted } from './service.js';

import type { Banner } from './types.js';

const DAY = 24 * 60 * 60 * 1000;

describe('inDayWindow', () => {
  it('正常區間', () => {
    expect(inDayWindow(new Date('2026-05-15T10:00:00'), { from: '09:00', to: '21:00' })).toBe(true);
    expect(inDayWindow(new Date('2026-05-15T08:00:00'), { from: '09:00', to: '21:00' })).toBe(false);
  });
  it('跨午夜', () => {
    expect(inDayWindow(new Date('2026-05-15T23:00:00'), { from: '22:00', to: '06:00' })).toBe(true);
    expect(inDayWindow(new Date('2026-05-15T03:00:00'), { from: '22:00', to: '06:00' })).toBe(true);
    expect(inDayWindow(new Date('2026-05-15T12:00:00'), { from: '22:00', to: '06:00' })).toBe(false);
  });
  it('無 window 永遠 true', () => {
    expect(inDayWindow(new Date())).toBe(true);
  });
});

describe('pickWeighted', () => {
  const items = [
    { id: 'a', weight: 70 },
    { id: 'b', weight: 30 },
  ];
  it('rand=0 取第一個', () => {
    expect(pickWeighted(items, 0)?.id).toBe('a');
  });
  it('rand=0.9 取第二個', () => {
    expect(pickWeighted(items, 0.9)?.id).toBe('b');
  });
  it('空陣列回 undefined', () => {
    expect(pickWeighted([] as { weight: number }[], 0.5)).toBeUndefined();
  });
});

describe('BannerService', () => {
  let banners: InMemoryBannerStore;
  let impressions: InMemoryImpressionStore;
  let clicks: InMemoryClickStore;
  let service: BannerService;
  let counter = 0;
  const now = new Date('2026-05-15T10:00:00Z');

  beforeEach(() => {
    banners = new InMemoryBannerStore();
    impressions = new InMemoryImpressionStore();
    clicks = new InMemoryClickStore();
    counter = 0;
    service = new BannerService(banners, impressions, clicks, {
      now: () => now,
      genId: () => `id_${++counter}`,
      random: () => 0,
    });
  });

  it('tickStatus 自動上下架', async () => {
    const start = new Date(now.getTime() - DAY);
    const end = new Date(now.getTime() + DAY);
    const b = await service.create({
      tenantId: 't1',
      slot: 'home-hero',
      title: 't',
      imageUrl: 'http://x',
      linkUrl: 'http://y',
      startAt: start,
      endAt: end,
      weight: 100,
    });
    const activated = await service.tickStatus('t1');
    expect(activated[0]?.id).toBe(b.id);
    expect(activated[0]?.status).toBe('active');

    const later = new Date(end.getTime() + 60_000);
    service = new BannerService(banners, impressions, clicks, {
      now: () => later,
      genId: () => `id2_${++counter}`,
    });
    const ended = await service.tickStatus('t1');
    expect(ended[0]?.status).toBe('ended');
  });

  it('resolveActive 依時段挑選 + A/B 加權', async () => {
    await service.create({
      tenantId: 't1',
      slot: 'home-hero',
      title: 'A',
      imageUrl: '',
      linkUrl: '',
      startAt: new Date(now.getTime() - DAY),
      endAt: new Date(now.getTime() + DAY),
      experimentGroup: 'g1',
      weight: 70,
    });
    await service.create({
      tenantId: 't1',
      slot: 'home-hero',
      title: 'B',
      imageUrl: '',
      linkUrl: '',
      startAt: new Date(now.getTime() - DAY),
      endAt: new Date(now.getTime() + DAY),
      experimentGroup: 'g1',
      weight: 30,
    });
    await service.tickStatus('t1');
    // random=0 取第一個（A 權重 70 排前）
    const pick = await service.resolveActive('t1', 'home-hero');
    expect(pick?.title).toBe('A');

    // 另一個 banner 的 night-only 不該出現在白天
    await service.create({
      tenantId: 't1',
      slot: 'home-secondary',
      title: 'night',
      imageUrl: '',
      linkUrl: '',
      startAt: new Date(now.getTime() - DAY),
      endAt: new Date(now.getTime() + DAY),
      dayWindow: { from: '22:00', to: '06:00' },
      weight: 100,
    });
    await service.tickStatus('t1');
    const eligible = filterEligible(
      await banners.listBySlot('t1', 'home-secondary'),
      new Date('2026-05-15T10:00:00'),
    );
    expect(eligible).toHaveLength(0);
  });

  it('recordImpression / recordClick + stats CTR', async () => {
    const b = await service.create({
      tenantId: 't1',
      slot: 'home-hero',
      title: '',
      imageUrl: '',
      linkUrl: '',
      startAt: new Date(now.getTime() - DAY),
      endAt: new Date(now.getTime() + DAY),
      weight: 100,
    });
    await service.recordImpression(b.id);
    await service.recordImpression(b.id);
    await service.recordImpression(b.id);
    await service.recordImpression(b.id);
    await service.recordClick(b.id);
    const s = await service.stats(b.id);
    expect(s.impressions).toBe(4);
    expect(s.clicks).toBe(1);
    expect(s.ctr).toBe(0.25);
  });

  it('create 拒絕 end <= start / weight < 0', async () => {
    const baseInput: Omit<Banner, 'id' | 'status' | 'createdAt'> = {
      tenantId: 't1',
      slot: 'home-hero',
      title: '',
      imageUrl: '',
      linkUrl: '',
      startAt: now,
      endAt: now,
      weight: 100,
    };
    await expect(service.create(baseInput)).rejects.toThrow('endAt');
    await expect(
      service.create({ ...baseInput, endAt: new Date(now.getTime() + DAY), weight: -1 }),
    ).rejects.toThrow('weight');
  });
});
