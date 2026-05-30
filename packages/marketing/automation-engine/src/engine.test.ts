import { describe, expect, it, vi } from 'vitest';

import { AutomationEngine } from './engine.js';
import {
  InMemoryWorkflowRunStore,
  InMemoryWorkflowStore,
} from './in-memory-store.js';

import type { ActionHandler, AutomationEvent, Scheduler } from './types.js';

const tenantId = 'tenant-1';

function makeEngine(opts?: {
  actions?: Record<string, ActionHandler>;
  scheduler?: Scheduler;
  maxAttempts?: number;
  now?: () => Date;
}) {
  const workflows = new InMemoryWorkflowStore();
  const runs = new InMemoryWorkflowRunStore();
  let counter = 0;
  const scheduled: Array<{ runId: string; at: Date }> = [];
  const scheduler: Scheduler = opts?.scheduler ?? {
    async schedule(runId, at) {
      scheduled.push({ runId, at });
    },
  };
  const engine = new AutomationEngine(workflows, runs, {
    actions: opts?.actions ?? {},
    scheduler,
    maxAttempts: opts?.maxAttempts ?? 3,
    now: opts?.now ?? (() => new Date('2026-05-15T00:00:00Z')),
    genId: () => `id_${++counter}`,
  });
  return { engine, workflows, runs, scheduled };
}

function event(name: string, payload: Record<string, unknown>): AutomationEvent {
  return { name, tenantId, payload, at: new Date('2026-05-15T00:00:00Z') };
}

describe('AutomationEngine', () => {
  it('createWorkflow 寫入 + 預設 enabled=true', async () => {
    const { engine, workflows } = makeEngine();
    const w = await engine.createWorkflow({
      tenantId,
      name: 'welcome',
      trigger: { event: 'user.signup' },
      steps: [],
    });
    expect(w.enabled).toBe(true);
    expect(await workflows.findById(w.id)).toBeDefined();
  });

  it('dispatch 不匹配時不建立 run', async () => {
    const { engine } = makeEngine();
    await engine.createWorkflow({
      tenantId,
      name: 'high-value',
      trigger: {
        event: 'order.paid',
        conditions: { field: 'totalMinor', op: 'gt', value: 100000 },
      },
      steps: [{ kind: 'action', action: 'send-email' }],
    });
    const runs = await engine.dispatch(event('order.paid', { totalMinor: 50000 }));
    expect(runs).toHaveLength(0);
  });

  it('純 action workflow 走完 → completed', async () => {
    const calls: Array<Record<string, unknown>> = [];
    const sendEmail = vi.fn<ActionHandler>(async (params) => {
      calls.push(params);
      return { ok: true, contextPatch: { emailSent: true } };
    });
    const { engine } = makeEngine({ actions: { 'send-email': sendEmail } });
    await engine.createWorkflow({
      tenantId,
      name: 'welcome',
      trigger: { event: 'user.signup' },
      steps: [{ kind: 'action', action: 'send-email', params: { template: 'welcome' } }],
    });
    const runs = await engine.dispatch(event('user.signup', { userId: 'u-1' }));
    expect(runs).toHaveLength(1);
    expect(runs[0]?.status).toBe('completed');
    expect(runs[0]?.context.emailSent).toBe(true);
    expect(calls[0]?.template).toBe('welcome');
  });

  it('delay step → waiting + 排程 + resumeDue 接續執行', async () => {
    const baseTime = new Date('2026-05-15T00:00:00Z');
    let nowVal = baseTime;
    const sendEmail = vi.fn<ActionHandler>(async () => ({ ok: true }));
    const { engine, runs, scheduled } = makeEngine({
      actions: { 'send-email': sendEmail },
      now: () => nowVal,
    });
    await engine.createWorkflow({
      tenantId,
      name: 'delayed',
      trigger: { event: 'order.paid' },
      steps: [
        { kind: 'delay', delayMs: 60_000 },
        { kind: 'action', action: 'send-email' },
      ],
    });
    const spawned = await engine.dispatch(event('order.paid', { orderId: 'o-1' }));
    expect(spawned[0]?.status).toBe('waiting');
    expect(scheduled).toHaveLength(1);
    expect(sendEmail).not.toHaveBeenCalled();

    // 時間推進到 resumeAt
    nowVal = new Date(baseTime.getTime() + 70_000);
    const resumed = await engine.resumeDue(nowVal);
    expect(resumed[0]?.status).toBe('completed');
    expect(sendEmail).toHaveBeenCalledTimes(1);

    const r = await runs.findById(spawned[0]!.id);
    expect(r?.status).toBe('completed');
  });

  it('gate 條件不符且 onFalse=stop → 直接 completed', async () => {
    const action = vi.fn<ActionHandler>(async () => ({ ok: true }));
    const { engine } = makeEngine({ actions: { 'send-coupon': action } });
    await engine.createWorkflow({
      tenantId,
      name: 'high-spender-only',
      trigger: { event: 'order.paid' },
      steps: [
        {
          kind: 'gate',
          condition: { field: 'totalMinor', op: 'gte', value: 100000 },
          onFalse: 'stop',
        },
        { kind: 'action', action: 'send-coupon' },
      ],
    });
    const runs = await engine.dispatch(event('order.paid', { totalMinor: 50000 }));
    expect(runs[0]?.status).toBe('completed');
    expect(action).not.toHaveBeenCalled();
  });

  it('gate onFalse=continue → 跳過 gate 但繼續執行', async () => {
    const action = vi.fn<ActionHandler>(async () => ({ ok: true }));
    const { engine } = makeEngine({ actions: { 'send-coupon': action } });
    await engine.createWorkflow({
      tenantId,
      name: 'always-send',
      trigger: { event: 'order.paid' },
      steps: [
        {
          kind: 'gate',
          condition: { field: 'totalMinor', op: 'gte', value: 100000 },
          onFalse: 'continue',
        },
        { kind: 'action', action: 'send-coupon' },
      ],
    });
    const runs = await engine.dispatch(event('order.paid', { totalMinor: 50000 }));
    expect(runs[0]?.status).toBe('completed');
    expect(action).toHaveBeenCalledTimes(1);
  });

  it('action 失敗會排程重試，達上限後標 failed', async () => {
    let nowVal = new Date('2026-05-15T00:00:00Z');
    const flaky = vi.fn<ActionHandler>(async () => ({ ok: false, error: '網路逾時' }));
    const { engine, runs } = makeEngine({
      actions: { flaky },
      maxAttempts: 2,
      now: () => nowVal,
    });
    await engine.createWorkflow({
      tenantId,
      name: 'flaky-run',
      trigger: { event: 'order.paid' },
      steps: [{ kind: 'action', action: 'flaky' }],
    });
    const spawned = await engine.dispatch(event('order.paid', {}));
    expect(spawned[0]?.status).toBe('waiting');
    expect(spawned[0]?.attempts).toBe(1);

    // 重試一次再失敗 → 達 maxAttempts → failed
    nowVal = new Date(nowVal.getTime() + 600_000);
    await engine.resumeDue(nowVal);
    const finalRun = await runs.findById(spawned[0]!.id);
    expect(finalRun?.status).toBe('failed');
    expect(finalRun?.attempts).toBe(2);
  });

  it('找不到動作時 run 直接 failed', async () => {
    const { engine } = makeEngine();
    await engine.createWorkflow({
      tenantId,
      name: 'broken',
      trigger: { event: 'order.paid' },
      steps: [{ kind: 'action', action: 'nonexistent' }],
    });
    const runs = await engine.dispatch(event('order.paid', {}));
    expect(runs[0]?.status).toBe('failed');
  });

  it('cancel 把 run 標為 cancelled', async () => {
    const { engine, runs } = makeEngine();
    await engine.createWorkflow({
      tenantId,
      name: 'long',
      trigger: { event: 'order.paid' },
      steps: [{ kind: 'delay', delayMs: 1_000_000 }],
    });
    const spawned = await engine.dispatch(event('order.paid', {}));
    const cancelled = await engine.cancel(spawned[0]!.id, '客戶退訂');
    expect(cancelled.status).toBe('cancelled');
    expect((await runs.findById(spawned[0]!.id))?.status).toBe('cancelled');
  });

  it('disabled workflow 不會被觸發', async () => {
    const { engine } = makeEngine();
    await engine.createWorkflow({
      tenantId,
      name: 'off',
      enabled: false,
      trigger: { event: 'order.paid' },
      steps: [],
    });
    const runs = await engine.dispatch(event('order.paid', {}));
    expect(runs).toHaveLength(0);
  });

  it('同事件多 workflow 都會觸發', async () => {
    const a = vi.fn<ActionHandler>(async () => ({ ok: true }));
    const b = vi.fn<ActionHandler>(async () => ({ ok: true }));
    const { engine } = makeEngine({ actions: { a, b } });
    await engine.createWorkflow({
      tenantId,
      name: 'A',
      trigger: { event: 'order.paid' },
      steps: [{ kind: 'action', action: 'a' }],
    });
    await engine.createWorkflow({
      tenantId,
      name: 'B',
      trigger: { event: 'order.paid' },
      steps: [{ kind: 'action', action: 'b' }],
    });
    const runs = await engine.dispatch(event('order.paid', {}));
    expect(runs).toHaveLength(2);
    expect(a).toHaveBeenCalled();
    expect(b).toHaveBeenCalled();
  });
});
