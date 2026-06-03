import { beforeEach, describe, expect, it } from 'vitest';

import {
  InMemoryCustomerProfileStore,
  InMemorySegmentStore,
} from './in-memory-store.js';
import { evalPredicate } from './predicate.js';
import { SegmentService } from './service.js';

import type { CustomerProfile, Predicate } from './types.js';

const DAY = 24 * 60 * 60 * 1000;

describe('evalPredicate leaves', () => {
  const now = new Date('2026-05-15T00:00:00Z');
  const profile: CustomerProfile = {
    tenantId: 't1',
    customerId: 'c1',
    tags: ['vip', 'meta-ad'],
    totalSpentMinor: 500_000,
    totalOrders: 12,
    lastOrderAt: new Date(now.getTime() - 200 * DAY),
    lifecycleStage: 'at-risk',
    consents: { email: true, line: false, sms: true },
  };

  it('eq / neq', () => {
    expect(
      evalPredicate({ op: 'eq', field: 'lifecycleStage', value: 'at-risk' }, profile, now),
    ).toBe(true);
    expect(
      evalPredicate({ op: 'neq', field: 'lifecycleStage', value: 'active' }, profile, now),
    ).toBe(true);
  });
  it('gt / gte / lt / lte', () => {
    expect(evalPredicate({ op: 'gt', field: 'totalSpentMinor', value: 100_000 }, profile, now)).toBe(true);
    expect(evalPredicate({ op: 'gte', field: 'totalOrders', value: 12 }, profile, now)).toBe(true);
    expect(evalPredicate({ op: 'lt', field: 'totalOrders', value: 5 }, profile, now)).toBe(false);
    expect(evalPredicate({ op: 'lte', field: 'totalOrders', value: 12 }, profile, now)).toBe(true);
  });
  it('has-tag / in / not-in', () => {
    expect(evalPredicate({ op: 'has-tag', field: 'tags', value: 'vip' }, profile, now)).toBe(true);
    expect(evalPredicate({ op: 'has-tag', field: 'tags', value: 'fb-ad' }, profile, now)).toBe(false);
    expect(
      evalPredicate({ op: 'in', field: 'lifecycleStage', value: ['at-risk', 'dormant'] }, profile, now),
    ).toBe(true);
    expect(
      evalPredicate({ op: 'not-in', field: 'lifecycleStage', value: ['active'] }, profile, now),
    ).toBe(true);
  });
  it('within-days / older-than-days', () => {
    expect(
      evalPredicate({ op: 'older-than-days', field: 'lastOrderAt', value: 90 }, profile, now),
    ).toBe(true);
    expect(
      evalPredicate({ op: 'within-days', field: 'lastOrderAt', value: 90 }, profile, now),
    ).toBe(false);
  });
  it('all / any / not', () => {
    const all: Predicate = {
      op: 'all',
      of: [
        { op: 'has-tag', field: 'tags', value: 'vip' },
        { op: 'gte', field: 'totalSpentMinor', value: 100_000 },
      ],
    };
    expect(evalPredicate(all, profile, now)).toBe(true);
    const not: Predicate = { op: 'not', of: { op: 'eq', field: 'lifecycleStage', value: 'active' } };
    expect(evalPredicate(not, profile, now)).toBe(true);
  });
  it('consents.email', () => {
    expect(evalPredicate({ op: 'eq', field: 'consents.email', value: true }, profile, now)).toBe(true);
    expect(evalPredicate({ op: 'eq', field: 'consents.line', value: false }, profile, now)).toBe(true);
  });
  it('fail-closed：未知單段欄位 throw（避免拼錯字被誤判）', () => {
    expect(() =>
      evalPredicate({ op: 'eq', field: 'totalSpent', value: 0 }, profile, now),
    ).toThrow(/未知 segment 欄位/);
    expect(() =>
      evalPredicate({ op: 'eq', field: 'vipLevel', value: 1 }, profile, now),
    ).toThrow(/customAttrs\.vipLevel/);
  });
  it('fail-closed：未知命名空間 throw', () => {
    expect(() =>
      evalPredicate({ op: 'eq', field: 'unknown.foo', value: 1 }, profile, now),
    ).toThrow(/未知 segment 欄位命名空間/);
  });
  it('customAttrs.xxx 顯式取值仍可運作', () => {
    const p: CustomerProfile = { ...profile, customAttrs: { vipLevel: 3 } };
    expect(
      evalPredicate({ op: 'eq', field: 'customAttrs.vipLevel', value: 3 }, p, now),
    ).toBe(true);
  });
});

describe('SegmentService', () => {
  let segments: InMemorySegmentStore;
  let profiles: InMemoryCustomerProfileStore;
  let service: SegmentService;
  let counter = 0;
  const now = new Date('2026-05-15T00:00:00Z');

  beforeEach(async () => {
    segments = new InMemorySegmentStore();
    profiles = new InMemoryCustomerProfileStore();
    counter = 0;
    service = new SegmentService(segments, profiles, {
      now: () => now,
      genId: () => `id_${++counter}`,
    });
    await profiles.upsert({
      tenantId: 't1',
      customerId: 'c1',
      tags: ['vip'],
      totalSpentMinor: 500_000,
      totalOrders: 10,
      lastOrderAt: new Date(now.getTime() - 100 * DAY),
      lifecycleStage: 'at-risk',
      consents: { email: true, line: false, sms: true },
    });
    await profiles.upsert({
      tenantId: 't1',
      customerId: 'c2',
      tags: [],
      totalSpentMinor: 10_000,
      totalOrders: 1,
      lastOrderAt: new Date(now.getTime() - 10 * DAY),
      lifecycleStage: 'new',
      consents: { email: false, line: true, sms: true },
    });
  });

  it('evaluate 動態抓符合的客戶', async () => {
    const s = await service.create({
      tenantId: 't1',
      name: 'VIP 30+ 天無訂單',
      predicate: {
        op: 'all',
        of: [
          { op: 'has-tag', field: 'tags', value: 'vip' },
          { op: 'older-than-days', field: 'lastOrderAt', value: 30 },
        ],
      },
    });
    const { members } = await service.evaluate(s.id);
    expect(members.map((m) => m.customerId)).toEqual(['c1']);
  });

  it('listPushTargets 過濾 consents', async () => {
    const s = await service.create({
      tenantId: 't1',
      name: '全體',
      predicate: { op: 'gte', field: 'totalOrders', value: 0 },
    });
    const emailTargets = await service.listPushTargets(s.id, 'email');
    expect(emailTargets.map((m) => m.customerId)).toEqual(['c1']);
    const lineTargets = await service.listPushTargets(s.id, 'line');
    expect(lineTargets.map((m) => m.customerId)).toEqual(['c2']);
  });

  it('updatePredicate 改完即時影響評估', async () => {
    const s = await service.create({
      tenantId: 't1',
      name: '舊',
      predicate: { op: 'eq', field: 'lifecycleStage', value: 'new' },
    });
    const before = await service.evaluate(s.id);
    expect(before.members.map((m) => m.customerId)).toEqual(['c2']);
    await service.updatePredicate(s.id, {
      op: 'eq',
      field: 'lifecycleStage',
      value: 'at-risk',
    });
    const after = await service.evaluate(s.id);
    expect(after.members.map((m) => m.customerId)).toEqual(['c1']);
  });

  it('isMember 即時判斷', async () => {
    const s = await service.create({
      tenantId: 't1',
      name: 'vip',
      predicate: { op: 'has-tag', field: 'tags', value: 'vip' },
    });
    expect(await service.isMember(s.id, 'c1')).toBe(true);
    expect(await service.isMember(s.id, 'c2')).toBe(false);
  });
});
