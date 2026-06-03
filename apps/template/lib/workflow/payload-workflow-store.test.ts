import { describe, expect, it, vi } from 'vitest';

import { createPayloadWorkflowStore } from './payload-workflow-store';

import type { Payload } from 'payload';

/**
 * PayloadWorkflowStore 行為測試。
 *
 * 只測：
 * - findById 過濾 activeVersion=true、回傳對映到 Workflow 結構
 * - listByProject 過濾 projectId + activeVersion=true
 * - insert / update / delete 全部 throw（read-only 保護）
 * - 找不到回 undefined
 *
 * 不測 Payload 內部行為（那是 Payload 自家 collection 測試的事）。
 */

function makeMockPayload(docs: Record<string, unknown>[]): Payload {
  return {
    find: vi.fn(async () => ({ docs, totalDocs: docs.length, totalPages: 1, page: 1, pagingCounter: 1, hasPrevPage: false, hasNextPage: false, prevPage: null, nextPage: null, limit: 10 })),
  } as unknown as Payload;
}

describe('createPayloadWorkflowStore', () => {
  it('findById：activeVersion=true 一筆 → 轉成 Workflow', async () => {
    const payload = makeMockPayload([
      {
        id: 42,
        workflowId: 'wf-a',
        projectId: 'p1',
        version: 'v1',
        activeVersion: true,
        name: 'demo',
        description: 'desc',
        status: 'active',
        nodes: [{ id: 't1' }],
        edges: [{ id: 'e1', source: 't1', target: 't2' }],
        pushedAt: '2026-05-20T00:00:00.000Z',
        createdAt: '2026-05-20T00:00:00.000Z',
        updatedAt: '2026-05-20T00:00:00.000Z',
      },
    ]);
    const store = createPayloadWorkflowStore(payload);
    const wf = await store.findById('wf-a');
    expect(wf).toBeDefined();
    expect(wf?.id).toBe('wf-a');
    expect(wf?.projectId).toBe('p1');
    expect(wf?.status).toBe('active');
    expect(wf?.nodes).toEqual([{ id: 't1' }]);
    expect(wf?.createdAt).toBeInstanceOf(Date);
  });

  it('findById：查不到 → undefined', async () => {
    const payload = makeMockPayload([]);
    const store = createPayloadWorkflowStore(payload);
    expect(await store.findById('none')).toBeUndefined();
  });

  it('findById：where 條件含 activeVersion=true', async () => {
    const payload = makeMockPayload([]);
    const store = createPayloadWorkflowStore(payload);
    await store.findById('wf-x');
    const call = (payload.find as unknown as { mock: { calls: unknown[][] } }).mock.calls[0]?.[0] as
      | { where: { and: Array<Record<string, unknown>> } }
      | undefined;
    expect(call?.where.and).toContainEqual({ activeVersion: { equals: true } });
    expect(call?.where.and).toContainEqual({ workflowId: { equals: 'wf-x' } });
  });

  it('listByProject：projectId + activeVersion 過濾', async () => {
    const payload = makeMockPayload([
      {
        id: 1,
        workflowId: 'wf-a',
        projectId: 'p1',
        version: 'v1',
        activeVersion: true,
        name: 'a',
        status: 'active',
        nodes: [],
        edges: [],
        pushedAt: '2026-05-20T00:00:00.000Z',
      },
    ]);
    const store = createPayloadWorkflowStore(payload);
    const list = await store.listByProject('p1');
    expect(list).toHaveLength(1);
    expect(list[0]!.id).toBe('wf-a');
  });

  it('insert / update / delete 全 throw（read-only）', async () => {
    const payload = makeMockPayload([]);
    const store = createPayloadWorkflowStore(payload);
    const dummy = {
      id: 'x',
      projectId: 'p1',
      name: 'x',
      status: 'draft' as const,
      nodes: [],
      edges: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await expect(store.insert(dummy)).rejects.toThrow(/read-only/);
    await expect(store.update(dummy)).rejects.toThrow(/read-only/);
    await expect(store.delete('x')).rejects.toThrow(/read-only/);
  });
});
