/**
 * InMemoryWorkflowRunStore 行為測試。
 *
 * 為何不測 DrizzleWorkflowRunStore：那需要 PGlite + drizzle schema 拉起來，
 * 是 integration scope 的工作。這裡只證 in-mem 行為跟 interface contract 一致，
 * 讓 admin UI 與 scheduler 可以放心用同一份介面。
 */

import { describe, expect, it } from 'vitest';

import { InMemoryWorkflowRunStore } from './run-store.js';

import type { RunState } from '@saas-factory/factory-workflows';

function makeRun(opts: {
  workflowId: string;
  startedAt: Date;
  status?: RunState['status'];
  resumeAt?: Date;
  endedAt?: Date;
}): RunState {
  return {
    workflowId: opts.workflowId,
    status: opts.status ?? 'running',
    cursor: undefined,
    context: {},
    log: [],
    startedAt: opts.startedAt,
    resumeAt: opts.resumeAt,
    endedAt: opts.endedAt,
  };
}

describe('InMemoryWorkflowRunStore', () => {
  it('listByWorkflow 只回對應 workflowId、按 startedAt 降序', async () => {
    const store = new InMemoryWorkflowRunStore();
    await store.insert(makeRun({ workflowId: 'wf-a', startedAt: new Date('2026-05-01T00:00:00Z') }));
    await store.insert(makeRun({ workflowId: 'wf-a', startedAt: new Date('2026-05-03T00:00:00Z') }));
    await store.insert(makeRun({ workflowId: 'wf-a', startedAt: new Date('2026-05-02T00:00:00Z') }));
    await store.insert(makeRun({ workflowId: 'wf-b', startedAt: new Date('2026-05-04T00:00:00Z') }));

    const result = await store.listByWorkflow('wf-a', 10);
    expect(result.map((r) => r.startedAt.toISOString())).toEqual([
      '2026-05-03T00:00:00.000Z',
      '2026-05-02T00:00:00.000Z',
      '2026-05-01T00:00:00.000Z',
    ]);
  });

  it('listByWorkflow 受 limit 限制', async () => {
    const store = new InMemoryWorkflowRunStore();
    for (let i = 0; i < 5; i++) {
      await store.insert(
        makeRun({
          workflowId: 'wf',
          startedAt: new Date(`2026-05-0${i + 1}T00:00:00Z`),
        }),
      );
    }
    const result = await store.listByWorkflow('wf', 2);
    expect(result).toHaveLength(2);
    expect(result[0]!.startedAt.toISOString()).toBe('2026-05-05T00:00:00.000Z');
  });

  it('listDue 只回 suspended + resumeAt <= now', async () => {
    const store = new InMemoryWorkflowRunStore();
    const now = new Date('2026-05-20T12:00:00Z');
    await store.insert(
      makeRun({
        workflowId: 'wf',
        startedAt: new Date('2026-05-20T11:00:00Z'),
        status: 'suspended',
        resumeAt: new Date('2026-05-20T11:30:00Z'),
      }),
    );
    await store.insert(
      makeRun({
        workflowId: 'wf',
        startedAt: new Date('2026-05-20T11:01:00Z'),
        status: 'suspended',
        resumeAt: new Date('2026-05-20T13:00:00Z'), // 還沒到期
      }),
    );
    await store.insert(
      makeRun({
        workflowId: 'wf',
        startedAt: new Date('2026-05-20T11:02:00Z'),
        status: 'running',
      }),
    );
    const due = await store.listDue(now, 10);
    expect(due).toHaveLength(1);
    expect(due[0]!.resumeAt!.toISOString()).toBe('2026-05-20T11:30:00.000Z');
  });
});
