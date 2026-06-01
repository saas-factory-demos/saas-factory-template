import { signRequest } from '@saas-factory/factory-hmac';

import type {
  SupportAccessAction,
  SupportAccessAuditLogRequest,
  SupportAccessAuditLogResponse,
  SupportAccessDisableRequest,
  SupportAccessDisableResponse,
  SupportAccessEnableRequest,
  SupportAccessEnableResponse,
  SupportAccessErrorResponse,
  SupportAccessProvisionRequest,
  SupportAccessProvisionResponse,
  SupportAccessRotateRequest,
  SupportAccessRotateResponse,
  SupportAccessStatusRequest,
  SupportAccessStatusResponse,
} from './types.js';

/** 客戶站 endpoint base path（與 template route 對齊）。 */
export const SUPPORT_ACCESS_BASE_PATH = '/api/factory/support-access';

/** Header 名稱常數，避免 typo。 */
export const SUPPORT_ACCESS_HEADERS = {
  TIMESTAMP: 'x-factory-support-timestamp',
  SIGNATURE: 'x-factory-support-signature',
} as const;

/** 客戶端 fetch wrapper return shape。 */
export type SupportAccessResult<T> = T | SupportAccessErrorResponse;

/** Client 介面：6 個動作對應 6 個 method。 */
export interface SupportAccessClient {
  provision(
    input: { siteUrl: string } & SupportAccessProvisionRequest,
  ): Promise<SupportAccessResult<SupportAccessProvisionResponse>>;
  rotatePassword(
    input: { siteUrl: string } & SupportAccessRotateRequest,
  ): Promise<SupportAccessResult<SupportAccessRotateResponse>>;
  disable(
    input: { siteUrl: string } & SupportAccessDisableRequest,
  ): Promise<SupportAccessResult<SupportAccessDisableResponse>>;
  enable(
    input: { siteUrl: string } & SupportAccessEnableRequest,
  ): Promise<SupportAccessResult<SupportAccessEnableResponse>>;
  status(
    input: { siteUrl: string } & SupportAccessStatusRequest,
  ): Promise<SupportAccessResult<SupportAccessStatusResponse>>;
  auditLog(
    input: { siteUrl: string } & SupportAccessAuditLogRequest,
  ): Promise<SupportAccessResult<SupportAccessAuditLogResponse>>;
}

/** Options for構造 client；測試可注入 fetch。 */
export interface CreateSupportAccessClientOptions {
  fetchImpl?: typeof fetch;
  /** 測試覆寫時間戳。 */
  nowSeconds?: () => number;
}

/**
 * 建立 HMAC 維修通道 client。
 *
 * Secret 強制 >= 32 字元；fail-closed 避免測試環境誤啟用。
 */
export function createSupportAccessClient(
  secret: string,
  options: CreateSupportAccessClientOptions = {},
): SupportAccessClient {
  if (!secret || secret.length < 32) {
    throw new Error('FACTORY_SUPPORT_SECRET 必須 >= 32 字元');
  }
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  const nowSeconds = options.nowSeconds ?? (() => Math.floor(Date.now() / 1000));

  async function call<TBody, TResp>(
    siteUrl: string,
    action: SupportAccessAction,
    body: TBody,
  ): Promise<SupportAccessResult<TResp>> {
    const path = `${SUPPORT_ACCESS_BASE_PATH}/${action}`;
    const url = new URL(path, siteUrl);
    const bodyStr = JSON.stringify(body);
    const timestamp = nowSeconds();
    const signature = signRequest(secret, {
      method: 'POST',
      path: url.pathname,
      body: bodyStr,
      timestamp,
    });
    try {
      const res = await fetchImpl(url, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          [SUPPORT_ACCESS_HEADERS.TIMESTAMP]: String(timestamp),
          [SUPPORT_ACCESS_HEADERS.SIGNATURE]: signature,
        },
        body: bodyStr,
      });
      const text = await res.text();
      let parsed: unknown;
      try {
        parsed = text ? JSON.parse(text) : null;
      } catch {
        return {
          ok: false,
          reason: 'internal-error',
          message: `回應非合法 JSON：HTTP ${res.status}`,
        };
      }
      if (!res.ok) {
        if (parsed && typeof parsed === 'object' && 'reason' in parsed) {
          return parsed as SupportAccessErrorResponse;
        }
        return {
          ok: false,
          reason: 'internal-error',
          message: `HTTP ${res.status}：${text.slice(0, 200)}`,
        };
      }
      return parsed as TResp;
    } catch (err) {
      return {
        ok: false,
        reason: 'internal-error',
        message: err instanceof Error ? err.message : String(err),
      };
    }
  }

  return {
    provision({ siteUrl, ...body }) {
      return call(siteUrl, 'provision', body);
    },
    rotatePassword({ siteUrl, ...body }) {
      return call(siteUrl, 'rotate-password', body);
    },
    disable({ siteUrl, ...body }) {
      return call(siteUrl, 'disable', body);
    },
    enable({ siteUrl, ...body }) {
      return call(siteUrl, 'enable', body);
    },
    status({ siteUrl, ...body }) {
      return call(siteUrl, 'status', body);
    },
    auditLog({ siteUrl, ...body }) {
      return call(siteUrl, 'audit-log', body);
    },
  };
}
