import {
  InMemoryWorkflowStore,
  type DispatchAction,
  type Workflow,
} from '@saas-factory/factory-workflows';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { InMemoryWorkflowRunStore, stateId } from './run-store.js';
import { WorkflowScheduler } from './scheduler.js';

const T0 = new Date('2026-05-20T00:00:00.000Z');

interface MockClock {
  (): Date;
  set: (next: Date) => void;
}

function clockMock(t: Date): MockClock {
  let cur = t;
  const fn = (() => cur) as MockClock;
  fn.set = (next: Date) => {
    cur = next;
  };
  return fn;
}

function buildWorkflow(overrides: Partial<Workflow> = {}): Workflow {
  return {
    id: 'wf-1',
    projectId: 'p1',
    name: 'demo',
    status: 'active',
    nodes: [
      {
        id: 't1',
        position: { x: 0, y: 0 },
        data: { kind: 'trigger', label: 'T', triggerType: 'manual' },
      },
      {
        id: 'd1',
        position: { x: 100, y: 0 },
        data: { kind: 'delay', label: 'D', duration: 1, unit: 'hour' },
      },
      {
        id: 'a1',
        position: { x: 200, y: 0 },
        data: { kind: 'action', label: 'A', actionType: 'add-tag', params: { tagId: 'x' } },
      },
    ],
    edges: [
      { id: 'e1', source: 't1', target: 'd1' },
      { id: 'e2', source: 'd1', target: 'a1' },
    ],
    createdAt: T0,
    updatedAt: T0,
    ...overrides,
  };
}

describe('WorkflowScheduler.startRun', () => {
  let workflows: InMemoryWorkflowStore;
  let runs: InMemoryWorkflowRunStore;

  beforeEach(() => {
    workflows = new InMemoryWorkflowStore();
    runs = new InMemoryWorkflowRunStore();
  });

  it('遇 delay 節點 → suspended + run 入庫', async () => {
    const wf = buildWorkflow();
    await workflows.insert(wf);
    const dispatch = vi.fn<DispatchAction>(async () => ({ ok: true as const }));
    const scheduler = new WorkflowScheduler(workflows, runs, dispatch, () => T0);

    const result = await scheduler.startRun({ workflowId: wf.id, triggerPayload: {} });
    expect(result.status).toBe('suspended');
    expect(result.resumeAt?.toISOString()).toBe('2026-05-20T01:00:00.000Z');
    expect(dispatch).not.toHaveBeenCalled();

    const stored = await runs.findById(stateId(result));
    expect(stored?.status).toBe('suspended');
  });

  it('workflow 不存在 → throw', async () => {
    const scheduler = new WorkflowScheduler(
      workflows,
      runs,
      async () => ({ ok: true }),
      () => T0,
    );
    await expect(scheduler.startRun({ workflowId: 'none', triggerPayload: {} })).rejects.toThrow(
      /不存在/,
    );
  });

  it('完全線性 workflow → completed', async () => {
    const wf = buildWorkflow({
      nodes: [
        {
          id: 't1',
          position: { x: 0, y: 0 },
          data: { kind: 'trigger', label: 'T', triggerType: 'manual' },
        },
        {
          id: 'a1',
          position: { x: 100, y: 0 },
          data: { kind: 'action', label: 'A', actionType: 'add-tag', params: { tagId: 'x' } },
        },
      ],
      edges: [{ id: 'e1', source: 't1', target: 'a1' }],
    });
    await workflows.insert(wf);
    const dispatch = vi.fn<DispatchAction>(async () => ({ ok: true as const }));
    const scheduler = new WorkflowScheduler(workflows, runs, dispatch, () => T0);
    const out = await scheduler.startRun({ workflowId: wf.id, triggerPayload: {} });
    expect(out.status).toBe('completed');
    expect(dispatch).toHaveBeenCalledOnce();
  });
});

describe('WorkflowScheduler.tick', () => {
  it('到期 run 被喚醒並執行下一個節點', async () => {
    const workflows = new InMemoryWorkflowStore();
    const runs = new InMemoryWorkflowRunStore();
    const wf = buildWorkflow();
    await workflows.insert(wf);
    const dispatch = vi.fn<DispatchAction>(async () => ({ ok: true as const }));
    const clock = clockMock(T0);
    const scheduler = new WorkflowScheduler(workflows, runs, dispatch, clock);

    await scheduler.startRun({ workflowId: wf.id, triggerPayload: {} });
    expect(dispatch).not.toHaveBeenCalled();

    const future = new Date('2026-05-20T01:30:00.000Z');
    const result = await scheduler.tick({ now: future });
    expect(result).toEqual({ processed: 1, failed: 0 });
    expect(dispatch).toHaveBeenCalledOnce();
  });

  it('未到期 run 不被處理', async () => {
    const workflows = new InMemoryWorkflowStore();
    const runs = new InMemoryWorkflowRunStore();
    const wf = buildWorkflow();
    await workflows.insert(wf);
    const dispatch = vi.fn<DispatchAction>(async () => ({ ok: true as const }));
    const scheduler = new WorkflowScheduler(workflows, runs, dispatch, () => T0);

    await scheduler.startRun({ workflowId: wf.id, triggerPayload: {} });
    const result = await scheduler.tick({ now: new Date('2026-05-20T00:30:00.000Z') });
    expect(result.processed).toBe(0);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('workflow 已刪 → 個別 run 標 failed，其他繼續', async () => {
    const workflows = new InMemoryWorkflowStore();
    const runs = new InMemoryWorkflowRunStore();
    const wf1 = buildWorkflow({ id: 'wf-a' });
    const wf2 = buildWorkflow({ id: 'wf-b' });
    await workflows.insert(wf1);
    await workflows.insert(wf2);
    const dispatch = vi.fn<DispatchAction>(async () => ({ ok: true as const }));
    const scheduler = new WorkflowScheduler(
      workflows,
      runs,
      dispatch,
      () => T0,
    );
    await scheduler.startRun({ workflowId: 'wf-a', triggerPayload: {} });
    await scheduler.startRun({ workflowId: 'wf-b', triggerPayload: {} });
    await workflows.delete('wf-a');

    const result = await scheduler.tick({ now: new Date('2026-05-20T02:00:00.000Z') });
    expect(result.processed).toBe(2);
    expect(result.failed).toBe(1);
    expect(dispatch).toHaveBeenCalledOnce();
  });

  it('maxBatch 限制批次大小', async () => {
    const workflows = new InMemoryWorkflowStore();
    const runs = new InMemoryWorkflowRunStore();
    const wf = buildWorkflow();
    await workflows.insert(wf);
    const dispatch = vi.fn<DispatchAction>(async () => ({ ok: true as const }));
    const clock = clockMock(T0);
    const scheduler = new WorkflowScheduler(workflows, runs, dispatch, clock);

    // 起 3 條 run；改 startedAt 讓 stateId 不同
    for (let i = 0; i < 3; i++) {
      clock.set(new Date(T0.getTime() + i * 1000));
      await scheduler.startRun({ workflowId: wf.id, triggerPayload: {} });
    }

    const future = new Date('2026-05-20T03:00:00.000Z');
    const result = await scheduler.tick({ now: future, maxBatch: 2 });
    expect(result.processed).toBe(2);
  });
});
