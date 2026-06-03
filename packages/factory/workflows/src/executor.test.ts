import { describe, expect, it, vi } from 'vitest';

import {
  evaluateCondition,
  initRunState,
  resume,
  run,
  step,
  type DispatchAction,
} from './executor.js';

import type { Workflow } from './index.js';

const NOW = new Date('2026-05-20T00:00:00.000Z');

function makeWorkflow(partial: Partial<Workflow> & Pick<Workflow, 'nodes' | 'edges'>): Workflow {
  return {
    id: 'wf-1',
    projectId: 'p1',
    name: 't',
    status: 'active',
    createdAt: NOW,
    updatedAt: NOW,
    ...partial,
  };
}

const okDispatch: DispatchAction = async () => ({ ok: true });

describe('initRunState', () => {
  it('cursor 指向 trigger 節點', () => {
    const wf = makeWorkflow({
      nodes: [
        {
          id: 't1',
          position: { x: 0, y: 0 },
          data: { kind: 'trigger', label: 'T', triggerType: 'manual' },
        },
      ],
      edges: [],
    });
    const s = initRunState({ workflow: wf, triggerPayload: { customer: { id: 'c1' } }, now: NOW });
    expect(s.cursor).toBe('t1');
    expect(s.status).toBe('running');
    expect(s.context).toEqual({ customer: { id: 'c1' } });
  });

  it('沒 trigger 則 throw', () => {
    const wf = makeWorkflow({ nodes: [], edges: [] });
    expect(() => initRunState({ workflow: wf, triggerPayload: {}, now: NOW })).toThrow(
      /缺 trigger/,
    );
  });
});

describe('step / run：線性流程', () => {
  it('trigger → action → 結束（completed）', async () => {
    const wf = makeWorkflow({
      nodes: [
        {
          id: 't1',
          position: { x: 0, y: 0 },
          data: { kind: 'trigger', label: 'T', triggerType: 'manual' },
        },
        {
          id: 'a1',
          position: { x: 100, y: 0 },
          data: { kind: 'action', label: 'A', actionType: 'add-tag', params: { tagId: 'vip' } },
        },
      ],
      edges: [{ id: 'e1', source: 't1', target: 'a1' }],
    });
    const dispatch = vi.fn<DispatchAction>(async () => ({ ok: true as const }));
    const start = initRunState({ workflow: wf, triggerPayload: {}, now: NOW });
    const out = await run(start, wf, { dispatchAction: dispatch, now: () => NOW });
    expect(out.status).toBe('completed');
    expect(out.log.map((l) => l.nodeId)).toEqual(['t1', 'a1']);
    expect(dispatch).toHaveBeenCalledOnce();
    expect(dispatch.mock.calls[0]?.[0].actionType).toBe('add-tag');
  });

  it('action params 模板會 render', async () => {
    const wf = makeWorkflow({
      nodes: [
        {
          id: 't1',
          position: { x: 0, y: 0 },
          data: { kind: 'trigger', label: 'T', triggerType: 'signup' },
        },
        {
          id: 'a1',
          position: { x: 100, y: 0 },
          data: {
            kind: 'action',
            label: 'A',
            actionType: 'send-email',
            params: { templateId: 'welcome', to: '{{customer.email}}' },
          },
        },
      ],
      edges: [{ id: 'e1', source: 't1', target: 'a1' }],
    });
    const dispatch = vi.fn<DispatchAction>(async () => ({ ok: true as const }));
    const s = initRunState({
      workflow: wf,
      triggerPayload: { customer: { email: 'x@y.z' } },
      now: NOW,
    });
    await run(s, wf, { dispatchAction: dispatch, now: () => NOW });
    expect(dispatch.mock.calls[0]?.[0].params.to).toBe('x@y.z');
  });

  it('action 回 ok:false → run failed + error 記在 context', async () => {
    const wf = makeWorkflow({
      nodes: [
        {
          id: 't1',
          position: { x: 0, y: 0 },
          data: { kind: 'trigger', label: 'T', triggerType: 'manual' },
        },
        {
          id: 'a1',
          position: { x: 100, y: 0 },
          data: { kind: 'action', label: 'A', actionType: 'webhook', params: {} },
        },
      ],
      edges: [{ id: 'e1', source: 't1', target: 'a1' }],
    });
    const dispatch: DispatchAction = async () => ({ ok: false, error: '500 Bad' });
    const s = initRunState({ workflow: wf, triggerPayload: {}, now: NOW });
    const out = await run(s, wf, { dispatchAction: dispatch, now: () => NOW });
    expect(out.status).toBe('failed');
    expect(out.context.__error).toBe('500 Bad');
  });

  it('dispatch output 會合進 context 供後續節點讀', async () => {
    const wf = makeWorkflow({
      nodes: [
        {
          id: 't1',
          position: { x: 0, y: 0 },
          data: { kind: 'trigger', label: 'T', triggerType: 'manual' },
        },
        {
          id: 'a1',
          position: { x: 100, y: 0 },
          data: { kind: 'action', label: 'A', actionType: 'create-task', params: {} },
        },
        {
          id: 'a2',
          position: { x: 200, y: 0 },
          data: { kind: 'action', label: 'B', actionType: 'send-email', params: {} },
        },
      ],
      edges: [
        { id: 'e1', source: 't1', target: 'a1' },
        { id: 'e2', source: 'a1', target: 'a2' },
      ],
    });
    const seen: Array<Record<string, unknown>> = [];
    const dispatch: DispatchAction = async (input) => {
      seen.push({ ...input.context });
      if (input.actionType === 'create-task') return { ok: true, output: { taskId: 't-99' } };
      return { ok: true };
    };
    await run(initRunState({ workflow: wf, triggerPayload: {}, now: NOW }), wf, {
      dispatchAction: dispatch,
      now: () => NOW,
    });
    expect(seen[1]?.taskId).toBe('t-99');
  });
});

describe('condition 分支', () => {
  it('依 condition 結果走 true/false handle', async () => {
    const wf = makeWorkflow({
      nodes: [
        {
          id: 't1',
          position: { x: 0, y: 0 },
          data: { kind: 'trigger', label: 'T', triggerType: 'manual' },
        },
        {
          id: 'c1',
          position: { x: 100, y: 0 },
          data: {
            kind: 'condition',
            label: 'C',
            field: 'customer.lifecycleStage',
            operator: 'eq',
            value: 'vip',
          },
        },
        {
          id: 'a-yes',
          position: { x: 200, y: -50 },
          data: { kind: 'action', label: 'Y', actionType: 'add-tag', params: { tagId: 'gold' } },
        },
        {
          id: 'a-no',
          position: { x: 200, y: 50 },
          data: { kind: 'action', label: 'N', actionType: 'add-tag', params: { tagId: 'std' } },
        },
      ],
      edges: [
        { id: 'e1', source: 't1', target: 'c1' },
        { id: 'e2', source: 'c1', sourceHandle: 'true', target: 'a-yes' },
        { id: 'e3', source: 'c1', sourceHandle: 'false', target: 'a-no' },
      ],
    });
    const dispatch = vi.fn<DispatchAction>(async () => ({ ok: true as const }));
    await run(
      initRunState({
        workflow: wf,
        triggerPayload: { customer: { lifecycleStage: 'vip' } },
        now: NOW,
      }),
      wf,
      { dispatchAction: dispatch, now: () => NOW },
    );
    expect(dispatch.mock.calls[0]?.[0].params.tagId).toBe('gold');
  });
});

describe('delay：suspend + resume', () => {
  it('delay 節點讓 run suspend 並算 resumeAt', async () => {
    const wf = makeWorkflow({
      nodes: [
        {
          id: 't1',
          position: { x: 0, y: 0 },
          data: { kind: 'trigger', label: 'T', triggerType: 'manual' },
        },
        {
          id: 'd1',
          position: { x: 100, y: 0 },
          data: { kind: 'delay', label: 'D', duration: 2, unit: 'hour' },
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
    });
    const dispatch = vi.fn<DispatchAction>(async () => ({ ok: true as const }));
    const out = await run(initRunState({ workflow: wf, triggerPayload: {}, now: NOW }), wf, {
      dispatchAction: dispatch,
      now: () => NOW,
    });
    expect(out.status).toBe('suspended');
    expect(out.cursor).toBe('a1');
    expect(out.resumeAt?.toISOString()).toBe('2026-05-20T02:00:00.000Z');
    expect(dispatch).not.toHaveBeenCalled();

    // resume → 跑完 a1
    const resumed = await run(resume(out), wf, { dispatchAction: dispatch, now: () => NOW });
    expect(resumed.status).toBe('completed');
    expect(dispatch).toHaveBeenCalledOnce();
  });

  it('resume 拒非 suspended state', () => {
    const wf = makeWorkflow({
      nodes: [
        {
          id: 't1',
          position: { x: 0, y: 0 },
          data: { kind: 'trigger', label: 'T', triggerType: 'manual' },
        },
      ],
      edges: [],
    });
    const s = initRunState({ workflow: wf, triggerPayload: {}, now: NOW });
    expect(() => resume(s)).toThrow(/只能恢復/);
  });
});

describe('maxSteps 防環', () => {
  it('A→B→A 形成環 → 達上限 → failed', async () => {
    const wf = makeWorkflow({
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
        {
          id: 'a2',
          position: { x: 200, y: 0 },
          data: { kind: 'action', label: 'B', actionType: 'add-tag', params: { tagId: 'y' } },
        },
      ],
      edges: [
        { id: 'e1', source: 't1', target: 'a1' },
        { id: 'e2', source: 'a1', target: 'a2' },
        { id: 'e3', source: 'a2', target: 'a1' },
      ],
    });
    const out = await run(initRunState({ workflow: wf, triggerPayload: {}, now: NOW }), wf, {
      dispatchAction: okDispatch,
      now: () => NOW,
    }, { maxSteps: 5 });
    expect(out.status).toBe('failed');
    expect(String(out.context.__error)).toMatch(/步數上限/);
  });
});

describe('evaluateCondition', () => {
  it('eq / neq', () => {
    expect(evaluateCondition('a', 'eq', 'a')).toBe(true);
    expect(evaluateCondition('a', 'neq', 'b')).toBe(true);
  });
  it('gt / lt 僅對 number 生效', () => {
    expect(evaluateCondition(5, 'gt', 3)).toBe(true);
    expect(evaluateCondition('5', 'gt', 3)).toBe(false);
  });
  it('contains string / array', () => {
    expect(evaluateCondition('hello', 'contains', 'ell')).toBe(true);
    expect(evaluateCondition(['a', 'b'], 'contains', 'a')).toBe(true);
  });
  it('in / not-in', () => {
    expect(evaluateCondition('a', 'in', ['a', 'b'])).toBe(true);
    expect(evaluateCondition('c', 'not-in', ['a', 'b'])).toBe(true);
  });
});

describe('step：節點不存在', () => {
  it('cursor 指向不存在節點 → failed', async () => {
    const wf = makeWorkflow({
      nodes: [
        {
          id: 't1',
          position: { x: 0, y: 0 },
          data: { kind: 'trigger', label: 'T', triggerType: 'manual' },
        },
      ],
      edges: [],
    });
    const s = initRunState({ workflow: wf, triggerPayload: {}, now: NOW });
    const broken = { ...s, cursor: 'missing' };
    const out = await step(broken, wf, { dispatchAction: okDispatch, now: NOW });
    expect(out.status).toBe('failed');
    expect(out.context.__error).toMatch(/節點不存在/);
  });
});
