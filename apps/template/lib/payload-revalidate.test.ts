import { describe, expect, it, vi } from 'vitest';

import { withRevalidateHooks } from './payload-revalidate.js';

import type { CollectionConfig } from 'payload';

/* next/cache 在 vitest 環境會被 dynamic import 抓不到 → revalidatePaths 走 catch
 * 略過。本測試只驗 hook 套用結構，不驗 revalidatePath 實際被呼叫
 * （那需 mock ESM 動態 import，成本高）。 */

const BASE: CollectionConfig = {
  slug: 'pages',
  fields: [{ name: 'title', type: 'text' }],
};

describe('withRevalidateHooks', () => {
  it('append afterChange + afterDelete hook（不覆蓋既有）', () => {
    const existing = vi.fn(({ doc }: { doc: unknown }) => doc);
    const base: CollectionConfig = {
      ...BASE,
      hooks: {
        afterChange: [existing],
      },
    };
    const wrapped = withRevalidateHooks(base, {
      revalidatePaths: () => ['/'],
    });
    expect(wrapped.hooks?.afterChange).toHaveLength(2);
    expect(wrapped.hooks?.afterChange?.[0]).toBe(existing);
    expect(wrapped.hooks?.afterDelete).toHaveLength(1);
  });

  it('原本沒有 hooks 也能套用', () => {
    const wrapped = withRevalidateHooks(BASE, {
      revalidatePaths: () => ['/'],
    });
    expect(wrapped.hooks?.afterChange).toHaveLength(1);
    expect(wrapped.hooks?.afterDelete).toHaveLength(1);
  });

  it('slug / fields / 其餘設定維持不動', () => {
    const wrapped = withRevalidateHooks(BASE, { revalidatePaths: () => [] });
    expect(wrapped.slug).toBe('pages');
    expect(wrapped.fields).toEqual(BASE.fields);
  });

  it('afterChange hook 在非 Next runtime 不 throw', async () => {
    const wrapped = withRevalidateHooks(BASE, {
      revalidatePaths: (doc) => [`/${(doc as { slug?: string })?.slug ?? ''}`],
    });
    const hook = wrapped.hooks?.afterChange?.[0] as
      | ((args: { doc: Record<string, unknown> }) => Promise<unknown>)
      | undefined;
    expect(hook).toBeDefined();
    /* vitest 環境 next/cache import 失敗 → catch → 不丟錯 */
    await expect(
      hook!({ doc: { slug: 'about' } }),
    ).resolves.toEqual({ slug: 'about' });
  });

  it('revalidatePaths 回空陣列也安全', async () => {
    const wrapped = withRevalidateHooks(BASE, { revalidatePaths: () => [] });
    const hook = wrapped.hooks?.afterChange?.[0] as
      | ((args: { doc: Record<string, unknown> }) => Promise<unknown>)
      | undefined;
    await expect(hook!({ doc: {} })).resolves.toEqual({});
  });
});
