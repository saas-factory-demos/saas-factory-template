import config from '@payload-config';
import {
  SUPPORT_ACCESS_BASE_PATH,
  SUPPORT_ACCESS_HEADERS,
  type SupportAccessAuditLogRequest,
  type SupportAccessDisableRequest,
  type SupportAccessEnableRequest,
  type SupportAccessProvisionRequest,
  type SupportAccessRotateRequest,
  type SupportAccessStatusRequest,
} from '@saas-factory/factory-support-access';
import * as Sentry from '@sentry/nextjs';
import { getPayload } from 'payload';

import {
  handleAuditLog,
  handleDisable,
  handleEnable,
  handleProvision,
  handleRotate,
  handleStatus,
  sanitizeIp,
  type PayloadLike,
} from '@/lib/factory-support-handlers';
import { verifyFactorySupportRequest } from '@/lib/factory-support-verify';

/** Factory ↔ Template 維修通道 API。詳見 ADR-0100 / goal-11。
 *
 * URL：POST /api/factory/support-access/[action]
 * 6 個 action：provision / rotate-password / disable / enable / status / audit-log
 *
 * 安全機制（與 bootstrap-admin 同邏輯）：
 * 1. FACTORY_SUPPORT_SECRET 未設定 → fail-closed（403）
 * 2. HMAC 簽章（method / path / timestamp / body）+ 5 分鐘時間漂移
 * 3. body 對應 action 的 shape 驗證
 *
 * 本檔為 thin wrapper：實際 DB 操作邏輯在 `lib/factory-support-handlers.ts`
 * （可單元測試）。每次成功 action 寫一筆 factory-support-logs（C 稽核策略）。
 */
export async function POST(
  request: Request,
  context: { params: Promise<{ action: string }> },
): Promise<Response> {
  const { action } = await context.params;
  const rawBody = await request.text();
  const url = new URL(request.url);

  const verifyResult = verifyFactorySupportRequest({
    secret: process.env.FACTORY_SUPPORT_SECRET,
    method: 'POST',
    path: url.pathname,
    action,
    rawBody,
    headers: {
      timestamp: request.headers.get(SUPPORT_ACCESS_HEADERS.TIMESTAMP),
      signature: request.headers.get(SUPPORT_ACCESS_HEADERS.SIGNATURE),
    },
  });

  if (!verifyResult.ok) {
    const status =
      verifyResult.reason === 'config-missing'
        ? 403
        : verifyResult.reason === 'not-found'
          ? 404
          : verifyResult.reason === 'headers-missing' || verifyResult.reason === 'body-invalid'
            ? 400
            : 401;
    // 驗章失敗也送 breadcrumb，後續若被當作 brute-force 時可追溯
    Sentry.addBreadcrumb({
      category: 'factory-support',
      level: 'warning',
      message: `verify failed：${verifyResult.reason}`,
      data: { action, status },
    });
    return Response.json(verifyResult, { status });
  }

  // 真實 Payload 介面比 PayloadLike 嚴格（collection slug 為 literal union）；
  // handler 用較鬆型別便於測試替身，這裡單向 cast 即可。
  const payload = (await getPayload({ config })) as unknown as PayloadLike;
  const clientIp = sanitizeIp(request.headers.get('x-forwarded-for'));
  const userAgent = request.headers.get('user-agent') ?? undefined;
  const meta = {
    ...(clientIp ? { clientIp } : {}),
    ...(userAgent ? { userAgent } : {}),
  };
  const validatedAction = verifyResult.action;
  const body = verifyResult.body as
    | SupportAccessProvisionRequest
    | SupportAccessRotateRequest
    | SupportAccessDisableRequest
    | SupportAccessEnableRequest
    | SupportAccessStatusRequest;

  // 成功驗章後 → 留 breadcrumb（不含 secret / password），對應 ADR-0100 稽核策略
  Sentry.addBreadcrumb({
    category: 'factory-support',
    level: 'info',
    message: `action：${validatedAction}`,
    data: {
      action: validatedAction,
      actorEmail: (body as { actorEmail?: string }).actorEmail ?? 'unknown',
      ...(clientIp ? { clientIp } : {}),
    },
  });

  try {
    switch (validatedAction) {
      case 'provision':
        return Response.json(
          await handleProvision(payload, body as SupportAccessProvisionRequest, meta),
        );
      case 'rotate-password':
        return Response.json(
          await handleRotate(payload, body as SupportAccessRotateRequest, meta),
        );
      case 'disable':
        return Response.json(
          await handleDisable(payload, body as SupportAccessDisableRequest, meta),
        );
      case 'enable':
        return Response.json(
          await handleEnable(payload, body as SupportAccessEnableRequest, meta),
        );
      case 'status':
        return Response.json(await handleStatus(payload, body as SupportAccessStatusRequest));
      case 'audit-log':
        return Response.json(await handleAuditLog(payload, body as SupportAccessAuditLogRequest));
      default:
        // 不會到這（verify 已篩）
        return Response.json(
          { ok: false, reason: 'not-found', message: `未知 action：${validatedAction}` },
          { status: 404 },
        );
    }
  } catch (err) {
    // 寫操作或 audit-log 失敗 → 送 Sentry 真實 exception；tags 加 action 方便篩
    Sentry.captureException(err, {
      tags: { feature: 'factory-support', action: validatedAction },
      level: 'error',
    });
    return Response.json(
      {
        ok: false,
        reason: 'internal-error',
        message: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}

// 確保 Next.js 不快取此路由（每次 POST 都要走實際 handler）
export const dynamic = 'force-dynamic';

// 防止意外的 GET / OPTIONS 探測
export async function GET(): Promise<Response> {
  return Response.json(
    {
      ok: false,
      reason: 'not-found',
      message: `本路徑只接受 POST：${SUPPORT_ACCESS_BASE_PATH}/[action]`,
    },
    { status: 405 },
  );
}
