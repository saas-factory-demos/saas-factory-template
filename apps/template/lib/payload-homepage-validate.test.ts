import { describe, expect, it, vi } from 'vitest';

import { withHomepageUniqueValidator } from './payload-homepage-validate.js';

import type { CollectionConfig } from 'payload';

const BASE: CollectionConfig = {
  slug: 'pages',
  fields: [{ name: 'title', type: 'text' }],
};

function getBeforeChangeHook(collection: CollectionConfig) {
  const hook = collection.hooks?.beforeChange?.[0];
  if (!hook) throw new Error('beforeChange hook 未掛上');
  return hook;
}

function makeReq(findMock: ReturnType<typeof vi.fn>) {
  return {
    payload: { find: findMock },
  } as unknown as Parameters<NonNullable<CollectionConfig['hooks']>['beforeChange'] extends Array<infer H> ? H : never>[0]['req'];
}

describe('withHomepageUniqueValidator', () => {
  it('isHomepage=false 直接放行（不打 DB）', async () => {
    const find = vi.fn();
    const wrapped = withHomepageUniqueValidator(BASE);
    const hook = getBeforeChangeHook(wrapped);
    const data = { isHomepage: false, tenantId: 't1' };
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const result = await (hook as any)({ data, req: makeReq(find), originalDoc: undefined });
    expect(result).toBe(data);
    expect(find).not.toHaveBeenCalled();
  });

  it('isHomepage=true 無衝突 → 放行', async () => {
    const find = vi.fn().mockResolvedValue({ totalDocs: 0, docs: [] });
    const wrapped = withHomepageUniqueValidator(BASE);
    const hook = getBeforeChangeHook(wrapped);
    const data = { isHomepage: true, tenantId: 't1' };
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const result = await (hook as any)({ data, req: makeReq(find), originalDoc: undefined });
    expect(result).toBe(data);
    expect(find).toHaveBeenCalledOnce();
  });

  it('isHomepage=true 但同 tenant 已有別筆 → throw', async () => {
    const find = vi.fn().mockResolvedValue({ totalDocs: 1, docs: [{ id: 99 }] });
    const wrapped = withHomepageUniqueValidator(BASE);
    const hook = getBeforeChangeHook(wrapped);
    const data = { isHomepage: true, tenantId: 't1' };
    await expect(
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      (hook as any)({ data, req: makeReq(find), originalDoc: undefined }),
    ).rejects.toThrow(/tenant t1 已有另一筆 isHomepage=true.*id=99/);
  });

  it('更新自己（id 相同）不算衝突', async () => {
    const find = vi.fn().mockResolvedValue({ totalDocs: 0, docs: [] });
    const wrapped = withHomepageUniqueValidator(BASE);
    const hook = getBeforeChangeHook(wrapped);
    const data = { isHomepage: true, tenantId: 't1' };
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    await (hook as any)({ data, req: makeReq(find), originalDoc: { id: 42, tenantId: 't1' } });
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          and: expect.arrayContaining([{ id: { not_equals: 42 } }]),
        }),
      }),
    );
  });

  it('沒 tenantId（data 與 originalDoc 都沒）→ 跳過驗證', async () => {
    const find = vi.fn();
    const wrapped = withHomepageUniqueValidator(BASE);
    const hook = getBeforeChangeHook(wrapped);
    const data = { isHomepage: true };
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    await (hook as any)({ data, req: makeReq(find), originalDoc: undefined });
    expect(find).not.toHaveBeenCalled();
  });

  it('既有 beforeChange hook 不被覆蓋', () => {
    const existing = vi.fn();
    const base: CollectionConfig = { ...BASE, hooks: { beforeChange: [existing] } };
    const wrapped = withHomepageUniqueValidator(base);
    expect(wrapped.hooks?.beforeChange).toHaveLength(2);
    expect(wrapped.hooks?.beforeChange?.[0]).toBe(existing);
  });
});
