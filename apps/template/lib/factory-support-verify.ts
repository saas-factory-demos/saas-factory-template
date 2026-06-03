import { verifySupportAccessRequest } from '@saas-factory/factory-support-access';

import type {
  SupportAccessAction,
  SupportAccessAuditLogRequest,
  SupportAccessDisableRequest,
  SupportAccessEnableRequest,
  SupportAccessProvisionRequest,
  SupportAccessRotateRequest,
  SupportAccessStatusRequest,
} from '@saas-factory/factory-support-access';

/**
 * 各 action 對應的 body 結構驗證器。
 *
 * 為何用 narrow function 而非 Zod：避免新增依賴；每個 action 欄位數小，
 * 直接 type guard 比較直觀。
 */
export function validateSupportAccessBody(
  action: SupportAccessAction,
  body: unknown,
): true | string {
  if (!body || typeof body !== 'object') return 'body 必須是物件';
  const b = body as Record<string, unknown>;

  switch (action) {
    case 'provision': {
      if (typeof b.email !== 'string' || !b.email.includes('@')) {
        return 'provision 需要合法 email';
      }
      if (typeof b.actorEmail !== 'string' || !b.actorEmail.includes('@')) {
        return 'provision 需要 actorEmail';
      }
      return true;
    }
    case 'rotate-password':
    case 'disable':
    case 'enable': {
      if (typeof b.actorEmail !== 'string' || !b.actorEmail.includes('@')) {
        return `${action} 需要 actorEmail`;
      }
      if (typeof b.reason !== 'string' || b.reason.length < 2) {
        return `${action} 需要 reason（>= 2 字元）`;
      }
      return true;
    }
    case 'status': {
      if (typeof b.actorEmail !== 'string' || !b.actorEmail.includes('@')) {
        return 'status 需要 actorEmail';
      }
      return true;
    }
    case 'audit-log': {
      if (typeof b.actorEmail !== 'string' || !b.actorEmail.includes('@')) {
        return 'audit-log 需要 actorEmail';
      }
      if (b.limit !== undefined) {
        if (typeof b.limit !== 'number' || !Number.isInteger(b.limit) || b.limit < 1 || b.limit > 100) {
          return 'audit-log 的 limit 必須是 1-100 之間的整數';
        }
      }
      if (b.before !== undefined && typeof b.before !== 'string') {
        return 'audit-log 的 before 必須是 ISO timestamp 字串';
      }
      if (b.filterAction !== undefined && typeof b.filterAction !== 'string') {
        return 'audit-log 的 filterAction 必須是字串';
      }
      return true;
    }
    default: {
      // 不會到這（verifySupportAccessRequest 已篩過 action）
      return `未知 action：${action satisfies never}`;
    }
  }
}

/**
 * Route handler thin wrapper：呼叫 support-access 套件，套上本檔的 body validator。
 *
 * 為何拆出來：route handler 依賴 getPayload runtime，難 unit test；
 * 驗章 + body validate 邏輯抽出後，可純 unit test 跑完所有 reject 分支。
 */
export function verifyFactorySupportRequest<
  TBody =
    | SupportAccessProvisionRequest
    | SupportAccessRotateRequest
    | SupportAccessDisableRequest
    | SupportAccessEnableRequest
    | SupportAccessStatusRequest
    | SupportAccessAuditLogRequest,
>(input: {
  secret: string | undefined;
  method: string;
  path: string;
  action: string;
  rawBody: string;
  headers: { timestamp: string | null; signature: string | null };
  now?: number;
}) {
  return verifySupportAccessRequest<TBody>({
    ...input,
    validateBody: validateSupportAccessBody,
  });
}
