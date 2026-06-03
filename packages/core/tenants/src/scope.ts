import { isGlobalCollection } from './global-collections.js';

import type {
  Access,
  CollectionConfig,
  FieldHook,
  PayloadRequest,
  Where,
} from 'payload';

/**
 * 從 request 解析當前 tenant id。
 *
 * 解析優先序：
 * 1. `req.context.tenantId`（API 內部明確傳遞）
 * 2. cookies `currentTenantId`（前台切換器寫的）
 * 3. user.tenants 的第一個（fallback、初登入時）
 */
export function getCurrentTenantId(
  req: PayloadRequest,
): string | null {
  const ctx = req.context as { tenantId?: unknown } | undefined;
  if (typeof ctx?.tenantId === 'string' && ctx.tenantId.length > 0) {
    return ctx.tenantId;
  }
  const cookieHeader = req.headers.get('cookie') ?? '';
  const match = /currentTenantId=([^;]+)/.exec(cookieHeader);
  if (match?.[1]) {
    return decodeURIComponent(match[1]);
  }
  const tenants = (req.user?.tenants as string[] | undefined) ?? [];
  return tenants[0] ?? null;
}

/**
 * 判斷此 request 是否獲准 bypass tenant filter。
 *
 * 只有 owner 角色 + 明確 `context.bypassTenant === true` 才放行；
 * 其他情況都不允許跨 tenant 讀寫。
 */
export function canBypassTenant(req: PayloadRequest): boolean {
  const role = (req.user?.role as string | undefined) ?? '';
  if (role !== 'owner') {
    return false;
  }
  const ctx = req.context as { bypassTenant?: unknown } | undefined;
  return ctx?.bypassTenant === true;
}

/**
 * 套用至 tenant-scoped collection 的 access function。
 *
 * 預期 collection 已有 `tenantId` 欄位。
 */
const tenantAccess: Access = ({ req }) => {
  if (!req.user) {
    return false;
  }
  if (canBypassTenant(req)) {
    return true;
  }
  const tenantId = getCurrentTenantId(req);
  if (!tenantId) {
    return false;
  }
  const where: Where = { tenantId: { equals: tenantId } };
  return where;
};

/**
 * beforeChange hook：create 時自動填入 `tenantId`、update 時禁止改 `tenantId`。
 */
const tenantBeforeChange: FieldHook = ({ data, operation, originalDoc, req }) => {
  if (operation === 'create') {
    if (data?.tenantId) {
      return data.tenantId as string;
    }
    const tenantId = getCurrentTenantId(req);
    if (!tenantId) {
      throw new Error('無 tenantId 可用，無法建立資料');
    }
    return tenantId;
  }
  if (operation === 'update') {
    // 不允許改 tenantId
    return (originalDoc?.tenantId as string | undefined) ?? data?.tenantId;
  }
  return data?.tenantId;
};

/**
 * 將任意 collection 套上多租戶隔離契約（ADR-0007）。
 *
 * - 加 `tenantId` 必填 + indexed 欄位
 * - access.read / update / delete 自動加 `tenantId` filter
 * - beforeChange hook 自動填 / 防改 `tenantId`
 *
 * 全域 collection（GLOBAL_COLLECTIONS）不會被套用、直接回傳原 config。
 */
export function tenantScoped(collection: CollectionConfig): CollectionConfig {
  if (isGlobalCollection(collection.slug)) {
    return collection;
  }

  const tenantIdField = {
    name: 'tenantId',
    type: 'text' as const,
    required: true,
    index: true,
    admin: { readOnly: true, description: '所屬 tenant id（自動填入）' },
    hooks: {
      beforeChange: [tenantBeforeChange],
    },
  };

  return {
    ...collection,
    fields: [tenantIdField, ...collection.fields],
    access: {
      ...collection.access,
      read: tenantAccess,
      update: tenantAccess,
      delete: tenantAccess,
    },
  };
}
