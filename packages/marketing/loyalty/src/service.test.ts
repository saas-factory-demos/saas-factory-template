import { beforeEach, describe, expect, it, vi } from 'vitest';

import { computeEarnPoints, resolveTier } from './helpers.js';
import {
  InMemoryCustomerTierStore,
  InMemoryPointEntryStore,
  InMemoryProgramConfigStore,
  InMemoryRedemptionStore,
  InMemoryRewardItemStore,
} from './in-memory-store.js';
import { LoyaltyService } from './service.js';

import type { LoyaltyProgramConfig, LoyaltyTier, RewardItem } from './types.js';

describe('LoyaltyService', () => {
  let entries: InMemoryPointEntryStore;
  let tiers: InMemoryCustomerTierStore;
  let rewards: InMemoryRewardItemStore;
  let redemptions: InMemoryRedemptionStore;
  let configs: InMemoryProgramConfigStore;
  let service: LoyaltyService;
  let issueReward: ReturnType<typeof vi.fn>;
  let counter = 0;
  const now = new Date('2026-05-15T00:00:00Z');

  const bronze: LoyaltyTier = {
    code: 'bronze',
    name: '銅',
    thresholdMinor: 0,
    earnMultiplier: 1,
    benefits: [],
  };
  const silver: LoyaltyTier = {
    code: 'silver',
    name: '銀',
    thresholdMinor: 50000_00, // 5 萬元
    earnMultiplier: 1.5,
    benefits: [],
  };
  const gold: LoyaltyTier = {
    code: 'gold',
    name: '金',
    thresholdMinor: 200000_00,
    earnMultiplier: 2,
    benefits: [],
  };
  const cfg: LoyaltyProgramConfig = {
    tenantId: 't1',
    minorPerPoint: 100, // 每 100 minor (1 元) 1 點
    pointLifetimeMonths: 12,
    tiers: [bronze, silver, gold],
  };

  beforeEach(async () => {
    entries = new InMemoryPointEntryStore();
    tiers = new InMemoryCustomerTierStore();
    rewards = new InMemoryRewardItemStore();
    redemptions = new InMemoryRedemptionStore();
    configs = new InMemoryProgramConfigStore();
    issueReward = vi.fn(async () => ({ ok: true, issuedCode: 'CP-XYZ' }));
    counter = 0;
    service = new LoyaltyService(
      entries,
      tiers,
      rewards,
      redemptions,
      configs,
      { issueReward },
      { now: () => now, genId: () => `id_${++counter}` },
    );
    await service.upsertProgram(cfg);
  });

  it('computeEarnPoints 與 resolveTier 純函式', () => {
    expect(computeEarnPoints(10000, bronze, cfg)).toBe(100); // 10000/100*1 = 100
    expect(computeEarnPoints(10000, silver, cfg)).toBe(150);
    expect(resolveTier(0, cfg.tiers).code).toBe('bronze');
    expect(resolveTier(50000_00, cfg.tiers).code).toBe('silver');
    expect(resolveTier(300000_00, cfg.tiers).code).toBe('gold');
  });

  it('earnFromOrder 累積點數並設定 expiresAt', async () => {
    const e = await service.earnFromOrder({
      tenantId: 't1',
      customerId: 'c1',
      orderId: 'o1',
      orderTotalMinor: 10000,
    });
    expect(e.points).toBe(100);
    expect(e.expiresAt).toBeDefined();
    const bal = await service.getBalance('t1', 'c1');
    expect(bal.available).toBe(100);
  });

  it('redeem 從 FIFO 消耗點數，issueReward 失敗回補', async () => {
    await service.earnFromOrder({
      tenantId: 't1',
      customerId: 'c1',
      orderId: 'o1',
      orderTotalMinor: 30000,
    });
    const r: RewardItem = await service.createReward({
      tenantId: 't1',
      name: '50 元折價券',
      costPoints: 100,
      kind: 'coupon',
      payloadRef: 'CP-50',
      status: 'active',
      stock: 5,
    });
    const ok = await service.redeem({ tenantId: 't1', customerId: 'c1', rewardId: r.id });
    expect(ok.status).toBe('issued');
    expect(ok.issuedCode).toBe('CP-XYZ');
    const bal = await service.getBalance('t1', 'c1');
    expect(bal.available).toBe(200); // 300 - 100
    expect(issueReward).toHaveBeenCalledTimes(1);

    // 庫存 -1
    const updated = await rewards.findById(r.id);
    expect(updated?.stock).toBe(4);

    // 失敗回補
    issueReward.mockResolvedValueOnce({ ok: false, error: 'provider down' });
    const r2 = await service.redeem({ tenantId: 't1', customerId: 'c1', rewardId: r.id });
    expect(r2.status).toBe('cancelled');
    const balAfter = await service.getBalance('t1', 'c1');
    expect(balAfter.available).toBe(200);
  });

  it('點數不足拋錯', async () => {
    const r = await service.createReward({
      tenantId: 't1',
      name: '昂貴',
      costPoints: 9999,
      kind: 'coupon',
      payloadRef: 'X',
      status: 'active',
    });
    await expect(
      service.redeem({ tenantId: 't1', customerId: 'c1', rewardId: r.id }),
    ).rejects.toThrow('點數不足');
  });

  it('sweepExpired 將過期 earn 沖銷', async () => {
    // 寫一筆已過期的 earn
    const past = new Date('2024-01-01T00:00:00Z');
    await service.earnFromOrder({
      tenantId: 't1',
      customerId: 'c1',
      orderId: 'o1',
      orderTotalMinor: 10000,
      at: past,
    });
    const swept = await service.sweepExpired('t1');
    expect(swept).toHaveLength(1);
    expect(swept[0]?.kind).toBe('expire');
    const bal = await service.getBalance('t1', 'c1');
    expect(bal.available).toBe(0);
  });

  it('refund clawback 反扣點數', async () => {
    await service.earnFromOrder({
      tenantId: 't1',
      customerId: 'c1',
      orderId: 'o1',
      orderTotalMinor: 20000,
    });
    await service.clawbackForRefund({
      tenantId: 't1',
      customerId: 'c1',
      orderId: 'o1',
      orderTotalMinor: 20000,
    });
    const bal = await service.getBalance('t1', 'c1');
    expect(bal.available).toBe(0);
  });

  it('recomputeTier 升級到 silver', async () => {
    // 製造 5 萬以上消費（500_00 minor = NT$500，需要 100 筆 NT$500 → 不夠）
    // 直接一筆 60000_00 minor
    await service.earnFromOrder({
      tenantId: 't1',
      customerId: 'c1',
      orderId: 'o1',
      orderTotalMinor: 60000_00,
    });
    const ct = await tiers.findByCustomer('t1', 'c1');
    expect(ct?.currentTier).toBe('silver');
  });

  it('issuePoints 後台補點', async () => {
    const e = await service.issuePoints({
      tenantId: 't1',
      customerId: 'c1',
      kind: 'earn-signup',
      points: 50,
      note: '註冊禮',
    });
    expect(e.points).toBe(50);
    const bal = await service.getBalance('t1', 'c1');
    expect(bal.available).toBe(50);
    await expect(
      service.issuePoints({
        tenantId: 't1',
        customerId: 'c1',
        kind: 'earn-manual',
        points: 0,
      }),
    ).rejects.toThrow('必須 > 0');
  });
});
