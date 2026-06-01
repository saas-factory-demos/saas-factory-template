import { describe, expect, it } from 'vitest';

import {
  InMemoryAssignmentStore,
  InMemoryExperimentMetricsStore,
  InMemoryExperimentStore,
} from './in-memory-store.js';
import { AbTestingService } from './service.js';
import { zTestProportions } from './significance.js';

import type { Experiment } from './types.js';

function setup(random: () => number = () => 0) {
  const experiments = new InMemoryExperimentStore();
  const assignments = new InMemoryAssignmentStore();
  const metrics = new InMemoryExperimentMetricsStore();
  let n = 0;
  const svc = new AbTestingService(experiments, assignments, metrics, {
    now: () => new Date('2026-05-15T10:00:00Z'),
    random,
    genId: () => `ex_${++n}`,
  });
  return { experiments, assignments, metrics, svc };
}

function expInput(): Omit<Experiment, 'id' | 'status' | 'startedAt' | 'concludedAt' | 'winningVariantId'> {
  return {
    tenantId: 't1',
    pageId: 'p1',
    name: 'hero title test',
    target: 'title',
    variants: [
      { id: 'A', label: 'A', trafficWeight: 0.5, payload: { title: '舊標題' } },
      { id: 'B', label: 'B', trafficWeight: 0.5, payload: { title: '新標題' } },
    ],
    minSamplesPerVariant: 100,
    significanceLevel: 0.05,
  };
}

describe('AbTestingService.create / start / pause', () => {
  it('建立草稿 + 啟動', async () => {
    const { svc } = setup();
    const exp = await svc.create(expInput());
    expect(exp.status).toBe('draft');
    const started = await svc.start(exp.id);
    expect(started.status).toBe('running');
    expect(started.startedAt).toBeDefined();
  });

  it('trafficWeight 加總不為 1 → throw', async () => {
    const { svc } = setup();
    const input = expInput();
    input.variants[0]!.trafficWeight = 0.6;
    await expect(svc.create(input)).rejects.toThrow(/加總/);
  });

  it('只有 1 個變體 → throw', async () => {
    const { svc } = setup();
    const input = expInput();
    input.variants = [input.variants[0]!];
    input.variants[0]!.trafficWeight = 1;
    await expect(svc.create(input)).rejects.toThrow(/至少需要/);
  });

  it('pause 只能 running → throw', async () => {
    const { svc } = setup();
    const exp = await svc.create(expInput());
    await expect(svc.pause(exp.id)).rejects.toThrow(/running/);
  });
});

describe('AbTestingService.assign', () => {
  it('同訪客拿同一 variant', async () => {
    const { svc } = setup(() => 0.6); // 偏向 B
    const exp = await svc.create(expInput());
    await svc.start(exp.id);
    const a1 = await svc.assign(exp.id, 'v1');
    const a2 = await svc.assign(exp.id, 'v1');
    expect(a1.id).toBe(a2.id);
  });

  it('assign 決定性：同 visitorId 不靠 Math.random，覆蓋掉 random override', async () => {
    // 即使 random 被綁定回 0.99，assign 結果應該完全由 visitorId 決定
    const { svc } = setup(() => 0.99);
    const exp = await svc.create(expInput());
    await svc.start(exp.id);
    const a1 = await svc.assign(exp.id, 'visitor-fixed');
    // 換一個新 service 但同 experimentId + visitorId（模擬 store 失憶）
    const { svc: svc2, experiments: e2 } = setup(() => 0);
    await e2.insert({ ...exp, status: 'running' });
    const a2 = await svc2.assign(exp.id, 'visitor-fixed');
    expect(a1.id).toBe(a2.id);
  });

  it('assign 分佈：50/50 trafficWeight 跑 1000 個訪客 → 兩桶都有量', async () => {
    const { svc } = setup();
    const exp = await svc.create(expInput());
    await svc.start(exp.id);
    const counts: Record<string, number> = { A: 0, B: 0 };
    for (let i = 0; i < 1000; i += 1) {
      const v = await svc.assign(exp.id, `visitor-${i}`);
      counts[v.id] = (counts[v.id] ?? 0) + 1;
    }
    expect(counts.A).toBeGreaterThan(400);
    expect(counts.B).toBeGreaterThan(400);
  });

  it('非 running → 回第一個 variant（不指派）', async () => {
    const { svc, assignments } = setup();
    const exp = await svc.create(expInput());
    const a = await svc.assign(exp.id, 'v1');
    expect(a.id).toBe('A');
    expect(await assignments.get(exp.id, 'v1')).toBeUndefined();
  });
});

describe('AbTestingService.recordConversion + report', () => {
  it('累計轉換 + 算 stats', async () => {
    let r = 0;
    const { svc } = setup(() => r);
    const exp = await svc.create(expInput());
    await svc.start(exp.id);
    for (let i = 0; i < 100; i += 1) {
      r = i < 50 ? 0 : 0.99;
      const v = await svc.assign(exp.id, `v${i}`);
      if (v.id === 'A' && i < 10) await svc.recordConversion(exp.id, `v${i}`);
      if (v.id === 'B' && i % 2 === 0) await svc.recordConversion(exp.id, `v${i}`);
    }
    const report = await svc.report(exp.id);
    expect(report.stats).toHaveLength(2);
    expect(report.significance).toHaveLength(1);
  });
});

describe('AbTestingService.autoConclude', () => {
  it('樣本不夠 → 維持 running', async () => {
    const { svc } = setup(() => 0);
    const exp = await svc.create(expInput());
    await svc.start(exp.id);
    const result = await svc.autoConclude(exp.id);
    expect(result.status).toBe('running');
  });

  it('樣本夠 + 顯著贏家 → conclude', async () => {
    let r = 0;
    const { svc, metrics } = setup(() => r);
    const exp = await svc.create({ ...expInput(), minSamplesPerVariant: 50 });
    await svc.start(exp.id);
    // 直接灌假資料：A 100 visitor 5 conv；B 100 visitor 30 conv
    for (let i = 0; i < 100; i += 1) {
      await metrics.recordVisitor(exp.id, 'A');
    }
    for (let i = 0; i < 5; i += 1) {
      await metrics.recordConversion(exp.id, 'A');
    }
    for (let i = 0; i < 100; i += 1) {
      await metrics.recordVisitor(exp.id, 'B');
    }
    for (let i = 0; i < 30; i += 1) {
      await metrics.recordConversion(exp.id, 'B');
    }
    r = 0;
    const concluded = await svc.autoConclude(exp.id);
    expect(concluded.status).toBe('concluded');
    expect(concluded.winningVariantId).toBe('B');
  });
});

describe('zTestProportions', () => {
  it('明顯差異 → significant=true', () => {
    const r = zTestProportions(
      { variantId: 'A', visitors: 1000, conversions: 50, conversionRate: 0.05 },
      { variantId: 'B', visitors: 1000, conversions: 100, conversionRate: 0.1 },
    );
    expect(r.significant).toBe(true);
    expect(r.uplift).toBeGreaterThan(0);
  });

  it('差不多 → significant=false', () => {
    const r = zTestProportions(
      { variantId: 'A', visitors: 100, conversions: 50, conversionRate: 0.5 },
      { variantId: 'B', visitors: 100, conversions: 51, conversionRate: 0.51 },
    );
    expect(r.significant).toBe(false);
  });

  it('零 visitor → pValue=1', () => {
    const r = zTestProportions(
      { variantId: 'A', visitors: 0, conversions: 0, conversionRate: 0 },
      { variantId: 'B', visitors: 100, conversions: 50, conversionRate: 0.5 },
    );
    expect(r.pValue).toBe(1);
  });
});
