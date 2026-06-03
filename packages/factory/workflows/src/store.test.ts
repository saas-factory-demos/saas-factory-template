import { describe, expect, it } from 'vitest';

import {
  InMemoryWorkflowStore,
  createEmptyWorkflow,
  validateWorkflow,
  type Workflow,
} from './index.js';

const NOW = new Date('2026-05-19T10:00:00Z');

function buildWorkflow(overrides?: Partial<Workflow>): Workflow {
  return {
    ...createEmptyWorkflow({ id: 'wf-1', projectId: 'proj-1', name: '測試 workflow', now: NOW }),
    ...overrides,
  };
}

describe('InMemoryWorkflowStore', () => {
  it('insert / findById / listByProject', async () => {
    const store = new InMemoryWorkflowStore();
    const w1 = buildWorkflow({ id: 'wf-1' });
    const w2 = buildWorkflow({
      id: 'wf-2',
      updatedAt: new Date('2026-05-20T00:00:00Z'),
    });
    await store.insert(w1);
    await store.insert(w2);

    expect((await store.findById('wf-1'))?.id).toBe('wf-1');
    const list = await store.listByProject('proj-1');
    expect(list.map((w) => w.id)).toEqual(['wf-2', 'wf-1']); // updatedAt desc
  });

  it('重複 insert 同 id 應 throw', async () => {
    const store = new InMemoryWorkflowStore();
    const w = buildWorkflow();
    await store.insert(w);
    await expect(store.insert(w)).rejects.toThrow(/已存在/);
  });

  it('update 不存在的 id 應 throw', async () => {
    const store = new InMemoryWorkflowStore();
    await expect(store.update(buildWorkflow({ id: 'ghost' }))).rejects.toThrow(/不存在/);
  });

  it('delete 後 findById 為 undefined', async () => {
    const store = new InMemoryWorkflowStore();
    await store.insert(buildWorkflow());
    await store.delete('wf-1');
    expect(await store.findById('wf-1')).toBeUndefined();
  });

  it('listByProject 只回該 project 的 workflow', async () => {
    const store = new InMemoryWorkflowStore();
    await store.insert(buildWorkflow({ id: 'wf-a', projectId: 'proj-A' }));
    await store.insert(buildWorkflow({ id: 'wf-b', projectId: 'proj-B' }));
    const list = await store.listByProject('proj-A');
    expect(list).toHaveLength(1);
    expect(list[0]?.id).toBe('wf-a');
  });
});

describe('createEmptyWorkflow', () => {
  it('產出一個 manual trigger 起始節點', () => {
    const w = createEmptyWorkflow({
      id: 'wf-x',
      projectId: 'proj-1',
      name: '新流程',
      now: NOW,
    });
    expect(w.status).toBe('draft');
    expect(w.nodes).toHaveLength(1);
    expect(w.nodes[0]?.data.kind).toBe('trigger');
    expect(w.edges).toEqual([]);
  });
});

describe('validateWorkflow', () => {
  it('空 nodes 應該回 trigger 缺失錯誤', () => {
    const errs = validateWorkflow({ nodes: [], edges: [] });
    expect(errs).toContain('workflow 必須包含至少一個 trigger 節點');
  });

  it('兩個 trigger 應該報錯', () => {
    const errs = validateWorkflow({
      nodes: [
        {
          id: 't1',
          position: { x: 0, y: 0 },
          data: { kind: 'trigger', label: 'A', triggerType: 'manual' },
        },
        {
          id: 't2',
          position: { x: 100, y: 0 },
          data: { kind: 'trigger', label: 'B', triggerType: 'signup' },
        },
      ],
      edges: [],
    });
    expect(errs).toContain('workflow 只能有一個 trigger 節點');
  });

  it('edge 指向不存在節點應該報錯', () => {
    const errs = validateWorkflow({
      nodes: [
        {
          id: 't1',
          position: { x: 0, y: 0 },
          data: { kind: 'trigger', label: 'A', triggerType: 'manual' },
        },
      ],
      edges: [{ id: 'e1', source: 't1', target: 'ghost' }],
    });
    expect(errs.some((e) => e.includes('target ghost 不存在'))).toBe(true);
  });

  it('自指 edge 應該報錯', () => {
    const errs = validateWorkflow({
      nodes: [
        {
          id: 't1',
          position: { x: 0, y: 0 },
          data: { kind: 'trigger', label: 'A', triggerType: 'manual' },
        },
      ],
      edges: [{ id: 'e1', source: 't1', target: 't1' }],
    });
    expect(errs.some((e) => e.includes('不可自指'))).toBe(true);
  });

  it('合法 workflow 回空陣列', () => {
    const errs = validateWorkflow({
      nodes: [
        {
          id: 't1',
          position: { x: 0, y: 0 },
          data: { kind: 'trigger', label: 'Signup', triggerType: 'signup' },
        },
        {
          id: 'a1',
          position: { x: 200, y: 0 },
          data: {
            kind: 'action',
            label: '寄歡迎信',
            actionType: 'send-email',
            params: { templateId: 'welcome' },
          },
        },
      ],
      edges: [{ id: 'e1', source: 't1', target: 'a1' }],
    });
    expect(errs).toEqual([]);
  });

  it('重複 edge（同 source/handle/target）應該報錯', () => {
    const errs = validateWorkflow({
      nodes: [
        {
          id: 't1',
          position: { x: 0, y: 0 },
          data: { kind: 'trigger', label: 'A', triggerType: 'manual' },
        },
        {
          id: 'a1',
          position: { x: 200, y: 0 },
          data: {
            kind: 'action',
            label: 'X',
            actionType: 'add-tag',
            params: { tagId: 'vip' },
          },
        },
      ],
      edges: [
        { id: 'e1', source: 't1', target: 'a1' },
        { id: 'e2', source: 't1', target: 'a1' },
      ],
    });
    expect(errs.some((e) => e.startsWith('重複 edge'))).toBe(true);
  });
});
