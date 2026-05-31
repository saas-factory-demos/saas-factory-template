import { beforeEach, describe, expect, it } from 'vitest';

import {
  InMemoryReferralCodeStore,
  InMemoryRedemptionStore,
  InMemoryRewardGrantStore,
} from './in-memory-store.js';
import { ReferralService } from './service.js';

import type { ReferralPolicy } from './types.js';

describe('ReferralService', () => {
  let codes: InMemoryReferralCodeStore;
  let redemptions: InMemoryRedemptionStore;
  let grants: InMemoryRewardGrantStore;
  let service: ReferralService;
  let counter = 0;
  const now = new Date('2026-05-15T00:00:00Z');
  const policy: ReferralPolicy = {
    trigger: 'first-purchase',
    referrerRewardMinor: 10000,
    refereeRewardMinor: 10000,
    maxRedemptionsPerReferrer: 3,
    duplicateWindowHours: 24,
  };

  beforeEach(() => {
    codes = new InMemoryReferralCodeStore();
    redemptions = new InMemoryRedemptionStore();
    grants = new InMemoryRewardGrantStore();
    counter = 0;
    service = new ReferralService(codes, redemptions, grants, policy, {
      now: () => now,
      genId: () => `id_${++counter}`,
      genCode: () => `CODE${++counter}`,
    });
  });

  it('getOrCreateCode 建立後第二次取回相同碼', async () => {
    const c1 = await service.getOrCreateCode('t1', 'c1');
    const c2 = await service.getOrCreateCode('t1', 'c1');
    expect(c1.code).toBe(c2.code);
  });

  it('redeem 成功：雙邊獎勵入帳 + usedCount++', async () => {
    const c = await service.getOrCreateCode('t1', 'referrer1');
    const r = await service.redeem({
      tenantId: 't1',
      code: c.code,
      refereeCustomerId: 'referee1',
      at: now,
    });
    expect(r.status).toBe('redeemed');
    const refGrants = await grants.listByCustomer('t1', 'referrer1');
    const reeGrants = await grants.listByCustomer('t1', 'referee1');
    expect(refGrants).toHaveLength(1);
    expect(reeGrants).toHaveLength(1);
    expect(refGrants[0]?.amountMinor).toBe(10000);
    const updated = await codes.findByCode('t1', c.code);
    expect(updated?.usedCount).toBe(1);
  });

  it('redeem 自推自被拒', async () => {
    const c = await service.getOrCreateCode('t1', 'c1');
    const r = await service.redeem({
      tenantId: 't1',
      code: c.code,
      refereeCustomerId: 'c1',
      at: now,
    });
    expect(r.status).toBe('rejected-self');
    expect(r.referrerRewardMinor).toBe(0);
  });

  it('redeem 同 referee 第二次被拒', async () => {
    const c = await service.getOrCreateCode('t1', 'r1');
    await service.redeem({
      tenantId: 't1',
      code: c.code,
      refereeCustomerId: 'ree',
      at: now,
    });
    const c2 = await service.getOrCreateCode('t1', 'r2');
    const dup = await service.redeem({
      tenantId: 't1',
      code: c2.code,
      refereeCustomerId: 'ree',
      at: now,
    });
    expect(dup.status).toBe('rejected-fraud');
  });

  it('redeem 同 ip 24 小時內第二次被拒', async () => {
    const c1 = await service.getOrCreateCode('t1', 'r1');
    await service.redeem({
      tenantId: 't1',
      code: c1.code,
      refereeCustomerId: 'ree1',
      refereeIp: '1.2.3.4',
      at: now,
    });
    const c2 = await service.getOrCreateCode('t1', 'r2');
    const dup = await service.redeem({
      tenantId: 't1',
      code: c2.code,
      refereeCustomerId: 'ree2',
      refereeIp: '1.2.3.4',
      at: new Date(now.getTime() + 60_000),
    });
    expect(dup.status).toBe('rejected-fraud');
  });

  it('redeem 超過 referrer 上限後拒絕', async () => {
    const c = await service.getOrCreateCode('t1', 'r1');
    for (let i = 0; i < 3; i++) {
      await service.redeem({
        tenantId: 't1',
        code: c.code,
        refereeCustomerId: `ree${i}`,
        at: now,
      });
    }
    const over = await service.redeem({
      tenantId: 't1',
      code: c.code,
      refereeCustomerId: 'reeX',
      at: now,
    });
    expect(over.status).toBe('rejected-cap');
  });

  it('renderShareTemplates 4 通道都有 link', () => {
    const tpls = service.renderShareTemplates('ABC', 'https://shop.test/signup');
    expect(tpls).toHaveLength(4);
    for (const t of tpls) {
      expect(t.text).toContain('ABC');
    }
  });

  it('getReferrerSummary 累積成功筆數與獎勵', async () => {
    const c = await service.getOrCreateCode('t1', 'r1');
    await service.redeem({
      tenantId: 't1',
      code: c.code,
      refereeCustomerId: 'ree1',
      at: now,
    });
    await service.redeem({
      tenantId: 't1',
      code: c.code,
      refereeCustomerId: 'ree2',
      at: now,
    });
    const sum = await service.getReferrerSummary('t1', 'r1');
    expect(sum.successCount).toBe(2);
    expect(sum.totalRewardMinor).toBe(20000);
    expect(sum.code).toBeTruthy();
  });
});
