import { beforeEach, describe, expect, it } from 'vitest';

import { InMemoryEnrollmentStore } from './in-memory-store.js';
import { EnrollmentService } from './service.js';

const TENANT = 't1';

describe('EnrollmentService', () => {
  let store: InMemoryEnrollmentStore;
  let svc: EnrollmentService;

  beforeEach(() => {
    store = new InMemoryEnrollmentStore();
    svc = new EnrollmentService(store);
  });

  it('enroll 建立有效報名 + hasAccess=true', async () => {
    await svc.enroll({ tenantId: TENANT, customerId: 'c1', courseId: 'cr1', source: 'purchase', orderId: 'o1' });
    expect(await svc.hasAccess(TENANT, 'c1', 'cr1')).toBe(true);
  });

  it('未報名 hasAccess=false', async () => {
    expect(await svc.hasAccess(TENANT, 'c1', 'cr1')).toBe(false);
  });

  it('過期 hasAccess=false', async () => {
    await svc.enroll({
      tenantId: TENANT,
      customerId: 'c1',
      courseId: 'cr1',
      source: 'subscription',
      expiresAt: new Date(Date.now() - 1000),
    });
    expect(await svc.hasAccess(TENANT, 'c1', 'cr1')).toBe(false);
  });

  it('revoke → hasAccess=false', async () => {
    await svc.enroll({ tenantId: TENANT, customerId: 'c1', courseId: 'cr1', source: 'purchase' });
    await svc.revoke({ tenantId: TENANT, customerId: 'c1', courseId: 'cr1' });
    expect(await svc.hasAccess(TENANT, 'c1', 'cr1')).toBe(false);
  });

  it('gift 設定 giftFrom', async () => {
    const e = await svc.giftEnroll({
      tenantId: TENANT,
      fromCustomerId: 'sender',
      toCustomerId: 'recipient',
      courseId: 'cr1',
    });
    expect(e.source).toBe('gift');
    expect(e.giftFrom).toBe('sender');
  });

  it('套裝一次解多堂', async () => {
    const bundle = await svc.upsertBundle({
      tenantId: TENANT,
      name: 'b',
      slug: 'b',
      courseIds: ['cr1', 'cr2', 'cr3'],
      price: 1000,
      enabled: true,
    });
    const ee = await svc.enrollBundle({
      tenantId: TENANT,
      customerId: 'c1',
      bundleId: bundle.id,
      orderId: 'o1',
    });
    expect(ee).toHaveLength(3);
    expect(await svc.hasAccess(TENANT, 'c1', 'cr2')).toBe(true);
  });

  it('套裝未啟用 → throw', async () => {
    const bundle = await svc.upsertBundle({
      tenantId: TENANT,
      name: 'b',
      slug: 'b',
      courseIds: ['cr1'],
      price: 1000,
      enabled: false,
    });
    await expect(
      svc.enrollBundle({ tenantId: TENANT, customerId: 'c1', bundleId: bundle.id }),
    ).rejects.toThrow(/未啟用/);
  });

  it('訂閱方案：includedCourseIds 命中', async () => {
    const plan = await svc.upsertPlan({
      tenantId: TENANT,
      name: 'p',
      slug: 'p',
      monthlyPrice: 299,
      includedCourseIds: ['cr1'],
      includedCategoryIds: [],
      enabled: true,
    });
    const e = await svc.unlockBySubscription({
      tenantId: TENANT,
      customerId: 'c1',
      planId: plan.id,
      courseId: 'cr1',
      expiresAt: new Date(Date.now() + 30 * 86400_000),
    });
    expect(e.source).toBe('subscription');
  });

  it('訂閱方案：includedCourseIds 不含且分類也不命中 → throw', async () => {
    const plan = await svc.upsertPlan({
      tenantId: TENANT,
      name: 'p',
      slug: 'p',
      monthlyPrice: 299,
      includedCourseIds: ['crX'],
      includedCategoryIds: [],
      enabled: true,
    });
    await expect(
      svc.unlockBySubscription({
        tenantId: TENANT,
        customerId: 'c1',
        planId: plan.id,
        courseId: 'cr1',
        expiresAt: new Date(),
      }),
    ).rejects.toThrow(/不在訂閱方案範圍/);
  });

  it('訂閱方案：分類解析 callback 命中', async () => {
    const svc2 = new EnrollmentService(store, {
      resolveCourseCategories: async (_t, c) => (c === 'cr-design' ? ['design'] : []),
    });
    const plan = await svc2.upsertPlan({
      tenantId: TENANT,
      name: 'p',
      slug: 'p',
      monthlyPrice: 299,
      includedCourseIds: [],
      includedCategoryIds: ['design'],
      enabled: true,
    });
    const e = await svc2.unlockBySubscription({
      tenantId: TENANT,
      customerId: 'c1',
      planId: plan.id,
      courseId: 'cr-design',
      expiresAt: new Date(Date.now() + 1000),
    });
    expect(e.source).toBe('subscription');
  });

  it('listActiveCourses 排除過期 / revoked', async () => {
    await svc.enroll({ tenantId: TENANT, customerId: 'c1', courseId: 'A', source: 'purchase' });
    await svc.enroll({
      tenantId: TENANT,
      customerId: 'c1',
      courseId: 'B',
      source: 'subscription',
      expiresAt: new Date(Date.now() - 1000),
    });
    await svc.enroll({ tenantId: TENANT, customerId: 'c1', courseId: 'C', source: 'purchase' });
    await svc.revoke({ tenantId: TENANT, customerId: 'c1', courseId: 'C' });
    const list = await svc.listActiveCourses(TENANT, 'c1');
    expect(list).toEqual(['A']);
  });

  it('sweepExpired 把過期 active 轉 expired', async () => {
    await svc.enroll({
      tenantId: TENANT,
      customerId: 'c1',
      courseId: 'A',
      source: 'subscription',
      expiresAt: new Date(Date.now() - 1000),
    });
    await svc.enroll({ tenantId: TENANT, customerId: 'c1', courseId: 'B', source: 'purchase' });
    const n = await svc.sweepExpired(TENANT);
    expect(n).toBe(1);
    const list = await store.listByCustomer(TENANT, 'c1');
    const a = list.find((e) => e.courseId === 'A');
    expect(a?.status).toBe('expired');
  });
});
