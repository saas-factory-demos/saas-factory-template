import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, CollectionConfig } from 'payload';

/**
 * 給 Payload collection 套用 Next.js revalidate hook 的 helper。
 *
 * Payload collection 的 afterChange / afterDelete 觸發時，
 * 呼叫 `next/cache` 的 `revalidatePath` 把對應頁面的 ISR cache 失效。
 *
 * 為何不直接寫進 buildPagesCollection（@saas-factory/cms-pages）：
 * - 該 package 應該保持 Next 中立（其他客戶可能用 Remix / vanilla Express）
 * - 路徑 mapping 跟前台路由結構耦合，由 apps/template 自己決定
 */
export interface RevalidateHooksOptions {
  /**
   * 依 doc 計算要 revalidate 的路徑陣列。
   *
   * - 多 locale：必須把 zh-TW / en 兩條路徑都列出
   * - 變更 isHomepage：需 revalidate 根 `/` + locale 根 `/zh-TW` `/en`
   * - 刪除：previousDoc 走同函式
   */
  revalidatePaths: (doc: Record<string, unknown> | undefined) => readonly string[];
}

/**
 * Wrap 一個 CollectionConfig，把 afterChange + afterDelete revalidate hook 接上去。
 *
 * 既有 hooks 不會被覆蓋——新 hook 追加在 array 尾巴。
 *
 * @example
 * withRevalidateHooks(buildPagesCollection(), {
 *   revalidatePaths: (doc) => doc.isHomepage ? ['/', '/zh-TW', '/en'] : [`/pages/${doc.slug}`],
 * });
 */
export function withRevalidateHooks(
  collection: CollectionConfig,
  options: RevalidateHooksOptions,
): CollectionConfig {
  const afterChange: CollectionAfterChangeHook = async ({ doc }) => {
    await revalidatePaths(options.revalidatePaths(doc as Record<string, unknown>));
    return doc;
  };

  const afterDelete: CollectionAfterDeleteHook = async ({ doc }) => {
    await revalidatePaths(options.revalidatePaths(doc as Record<string, unknown>));
    return doc;
  };

  return {
    ...collection,
    hooks: {
      ...collection.hooks,
      afterChange: [...(collection.hooks?.afterChange ?? []), afterChange],
      afterDelete: [...(collection.hooks?.afterDelete ?? []), afterDelete],
    },
  };
}

/**
 * 動態載入 `next/cache.revalidatePath`，逐一打。
 *
 * - 動態 import：避免 Payload runtime 在非 Next 環境（如純 CLI seed）爆炸
 * - try/catch 每條路徑：單條失敗不影響其他
 * - 不丟錯：admin 改頁面不應因 revalidate 失敗整個 500
 */
async function revalidatePaths(paths: readonly string[]): Promise<void> {
  if (paths.length === 0) return;
  let revalidatePath: ((path: string, type?: 'page' | 'layout') => void) | undefined;
  try {
    ({ revalidatePath } = await import('next/cache'));
  } catch {
    /* 非 Next runtime（CLI seed / 測試），略過 */
    return;
  }
  if (!revalidatePath) return;
  for (const path of paths) {
    try {
      revalidatePath(path, 'page');
    } catch (err) {
      /* 單條失敗不阻擋其他 */
      console.warn('[payload-revalidate] failed to revalidate', path, err);
    }
  }
}
