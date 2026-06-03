import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload';

/**
 * 給 Pages collection 套上「同一 tenant 只能有一筆 isHomepage=true」的 runtime 驗證。
 *
 * 為何不只靠 type / UI：Payload admin 沒內建 unique constraint 在 boolean 欄位，
 * 後台可能誤把兩頁都打勾 isHomepage → 前台 loadHomePage 撈到第一筆，第二頁變成「幽靈首頁」。
 *
 * 為何寫在 template 而非 cms-pages package：
 * - tenantId 欄位是 template 的多租戶模型，cms-pages 對 tenant 中立
 * - validate 邏輯依賴 payload.find，跑 collection-level query
 *
 * 行為：
 * - 新建 / 更新一筆 isHomepage=true → 撈同 tenant 其他 isHomepage=true 的頁
 * - 找到 → throw ValidationError（Payload 自動接成 400）
 * - 自己更新自己（id 相同）不擋
 */
export function withHomepageUniqueValidator(collection: CollectionConfig): CollectionConfig {
  const beforeChange: CollectionBeforeChangeHook = async ({ data, originalDoc, req }) => {
    const incoming = data as { isHomepage?: boolean; tenantId?: string };
    if (incoming.isHomepage !== true) return data;
    const tenantId = incoming.tenantId ?? (originalDoc as { tenantId?: string } | undefined)?.tenantId;
    if (!tenantId) return data;
    const selfId = (originalDoc as { id?: string | number } | undefined)?.id;

    const existing = await req.payload.find({
      collection: collection.slug as 'pages',
      where: {
        and: [
          { tenantId: { equals: tenantId } },
          { isHomepage: { equals: true } },
          ...(selfId !== undefined ? [{ id: { not_equals: selfId } }] : []),
        ],
      },
      limit: 1,
      depth: 0,
    });

    if (existing.totalDocs > 0) {
      const conflictId = existing.docs[0]?.id;
      throw new Error(
        `tenant ${tenantId} 已有另一筆 isHomepage=true（id=${String(conflictId)}），請先取消那一頁的首頁設定再儲存。`,
      );
    }
    return data;
  };

  return {
    ...collection,
    hooks: {
      ...collection.hooks,
      beforeChange: [...(collection.hooks?.beforeChange ?? []), beforeChange],
    },
  };
}
