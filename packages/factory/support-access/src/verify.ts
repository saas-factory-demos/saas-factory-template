import { verifyRequest } from '@saas-factory/factory-hmac';

import { SUPPORT_ACCESS_BASE_PATH, SUPPORT_ACCESS_HEADERS } from './client.js';

import type { SupportAccessAction, SupportAccessErrorResponse } from './types.js';

/** 6 個合法 action（與 client / route 對齊）。 */
export const SUPPORT_ACCESS_ACTIONS: readonly SupportAccessAction[] = [
  'provision',
  'rotate-password',
  'disable',
  'enable',
  'status',
  'audit-log',
] as const;

/** verify 成功時回傳的內容。 */
export interface SupportAccessVerifyOk<TBody = unknown> {
  ok: true;
  action: SupportAccessAction;
  body: TBody;
}

/** 與 ErrorResponse 同 shape，方便 route 直接回。 */
export type SupportAccessVerifyError = SupportAccessErrorResponse;

/** Verify input。 */
export interface VerifySupportAccessRequestInput {
  secret: string | undefined;
  method: string;
  path: string;
  /** 從 URL 抓出來的 action segment。 */
  action: string;
  rawBody: string;
  headers: { timestamp: string | null; signature: string | null };
  /** 測試覆寫。 */
  now?: number;
  /** 自訂 body validator（每 action 可不同 schema）。 */
  validateBody?: (action: SupportAccessAction, body: unknown) => true | string;
}

/**
 * 驗證 factory → template 維修通道請求。
 *
 * 流程：
 * 1. secret 必填（fail-closed，未設不允許開放此 API）
 * 2. action 必須在 SUPPORT_ACCESS_ACTIONS 白名單
 * 3. headers 完整（timestamp + signature）
 * 4. HMAC 簽章 + 時間漂移 <= 5 分鐘
 * 5. body 合法 JSON
 * 6. 可選 caller-provided validator
 */
export function verifySupportAccessRequest<TBody = unknown>(
  input: VerifySupportAccessRequestInput,
): SupportAccessVerifyOk<TBody> | SupportAccessVerifyError {
  if (!input.secret) {
    return {
      ok: false,
      reason: 'config-missing',
      message: 'FACTORY_SUPPORT_SECRET 未設定，support-access endpoint 不開放',
    };
  }
  if (input.secret.length < 32) {
    return {
      ok: false,
      reason: 'config-missing',
      message: 'FACTORY_SUPPORT_SECRET 必須 >= 32 字元',
    };
  }
  if (!SUPPORT_ACCESS_ACTIONS.includes(input.action as SupportAccessAction)) {
    return {
      ok: false,
      reason: 'not-found',
      message: `未知 action：${input.action}`,
    };
  }
  const action = input.action as SupportAccessAction;
  if (!input.headers.timestamp || !input.headers.signature) {
    return {
      ok: false,
      reason: 'headers-missing',
      message: `缺少 ${SUPPORT_ACCESS_HEADERS.TIMESTAMP} 或 ${SUPPORT_ACCESS_HEADERS.SIGNATURE}`,
    };
  }
  const timestamp = Number.parseInt(input.headers.timestamp, 10);
  if (!Number.isFinite(timestamp)) {
    return {
      ok: false,
      reason: 'hmac-malformed',
      message: 'timestamp header 非合法數字',
    };
  }
  // path 必須符合 BASE_PATH/<action>
  const expectedPath = `${SUPPORT_ACCESS_BASE_PATH}/${action}`;
  if (input.path !== expectedPath) {
    return {
      ok: false,
      reason: 'hmac-malformed',
      message: `path 與 action 不符：expected ${expectedPath}, got ${input.path}`,
    };
  }
  const verifyResult = verifyRequest(
    input.secret,
    {
      method: input.method,
      path: input.path,
      body: input.rawBody,
      timestamp,
      signature: input.headers.signature,
    },
    input.now !== undefined ? { now: input.now } : {},
  );
  if (!verifyResult.ok) {
    return {
      ok: false,
      reason:
        verifyResult.reason === 'malformed'
          ? 'hmac-malformed'
          : verifyResult.reason === 'expired'
            ? 'hmac-expired'
            : 'hmac-mismatch',
      message: `HMAC 驗證失敗：${verifyResult.reason}`,
    };
  }
  let parsed: unknown;
  try {
    parsed = input.rawBody ? JSON.parse(input.rawBody) : {};
  } catch {
    return { ok: false, reason: 'body-invalid', message: 'body 非合法 JSON' };
  }
  if (input.validateBody) {
    const v = input.validateBody(action, parsed);
    if (v !== true) {
      return { ok: false, reason: 'body-invalid', message: v };
    }
  }
  return { ok: true, action, body: parsed as TBody };
}
