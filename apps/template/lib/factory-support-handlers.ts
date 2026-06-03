/**
 * Factory Support Access 6 個 action 的純 handler（ADR-0100 / goal-11）。
 *
 * 從 `/api/factory/support-access/[action]/route.ts` 抽出來方便單元測試：
 * - route.ts 仍是 thin wrapper（解 URL、驗 HMAC、寫 Sentry、dispatch）
 * - 本檔的 handler 函式吃 PayloadLike interface（最小集），不依賴真實 Payload runtime
 * - 測試可注入 in-memory 模擬 PayloadLike，覆蓋所有寫 / 讀路徑
 *
 * 設計選擇：
 * - 抽出而非 inline：handler 內部有條件分支（provision idempotent / status 無 user），
 *   未抽出時這些分支只能跑 e2e Postgres container 才能驗，成本高
 * - 改用 PayloadLike 而非完整 Payload 型別：避免測試裡假裝整個 Payload runtime，
 *   只需要 `find / create / update / count` 4 個 method
 */

import { randomBytes } from 'node:crypto';

import type {
  SupportAccessAuditEntry,
  SupportAccessAuditLogRequest,
  SupportAccessAuditLogResponse,
  SupportAccessDisableRequest,
  SupportAccessDisableResponse,
  SupportAccessEnableRequest,
  SupportAccessEnableResponse,
  SupportAccessProvisionRequest,
  SupportAccessProvisionResponse,
  SupportAccessRotateRequest,
  SupportAccessRotateResponse,
  SupportAccessStatusRequest,
  SupportAccessStatusResponse,
} from '@saas-factory/factory-support-access';

/**
 * Payload 4 個 method 的最小子集（取代 `Awaited<ReturnType<typeof getPayload>>`）。
 * 真實 Payload instance 也符合此介面，可直接傳入；測試可塞 in-memory fake。
 *
 * 為何用 unknown：Payload 回傳的 docs 形狀依 collection 不同，handler 內部自己窄化。
 */
export interface PayloadLike {
  find(args: {
    collection: string;
    where?: unknown;
    limit?: number;
    sort?: string;
    overrideAccess?: boolean;
    depth?: number;
  }): Promise<{ docs: unknown[]; totalDocs: number }>;
  create(args: {
    collection: string;
    data: Record<string, unknown>;
    overrideAccess?: boolean;
    context?: Record<string, unknown>;
  }): Promise<unknown>;
  update(args: {
    collection: string;
    id: number | string;
    data: Record<string, unknown>;
    overrideAccess?: boolean;
    context?: Record<string, unknown>;
  }): Promise<unknown>;
  count(args: {
    collection: string;
    where?: unknown;
    overrideAccess?: boolean;
  }): Promise<{ totalDocs: number }>;
}

/** factory-support-logs collection 的 action 欄位允許值（與 SupportAccessAction 區分）。 */
export type AuditLogActionValue =
  | 'provision'
  | 'rotate-password'
  | 'disable'
  | 'enable'
  | 'status'
  | 'login'
  | 'manual-action';

/** 共用 audit log 寫入 helper。 */
async function writeAuditLog(
  payload: PayloadLike,
  entry: {
    action: AuditLogActionValue;
    actorEmail: string;
    payloadSummary: string;
    relatedUserId?: number | string;
    clientIp?: string;
    userAgent?: string;
  },
): Promise<void> {
  await payload.create({
    collection: 'factory-support-logs',
    overrideAccess: true,
    data: {
      action: entry.action,
      actorEmail: entry.actorEmail,
      payloadSummary: entry.payloadSummary,
      timestamp: new Date().toISOString(),
      ...(entry.clientIp ? { clientIp: entry.clientIp } : {}),
      ...(entry.userAgent ? { userAgent: entry.userAgent } : {}),
      ...(entry.relatedUserId !== undefined
        ? { relatedUserId: Number(entry.relatedUserId) }
        : {}),
    },
  });
}

/** 找出 factory-support user（最多應該只有一個）。 */
async function findFactorySupportUser(payload: PayloadLike): Promise<{
  id: number | string;
  email: string;
  factoryAccessDisabledAt?: string | null;
} | null> {
  const res = await payload.find({
    collection: 'users',
    where: { role: { equals: 'factory-support' } },
    limit: 1,
    overrideAccess: true,
  });
  const first = res.docs[0];
  if (!first) return null;
  return first as { id: number | string; email: string; factoryAccessDisabledAt?: string | null };
}

/** 產生 24 字元安全密碼（base64url 截斷）。 */
function generatePassword(): string {
  return randomBytes(18).toString('base64url').slice(0, 24);
}

/** 共用 IP 旁路 meta 結構。 */
export interface HandlerMeta {
  clientIp?: string;
  userAgent?: string;
}

/**
 * 6 個 action 對應 6 個 handler。皆 async，吃 PayloadLike + body + meta。
 */

/** handleProvision：idempotent 建 factory-support 帳號。 */
export async function handleProvision(
  payload: PayloadLike,
  body: SupportAccessProvisionRequest,
  meta: HandlerMeta,
): Promise<SupportAccessProvisionResponse> {
  const existing = await findFactorySupportUser(payload);
  if (existing) {
    await writeAuditLog(payload, {
      action: 'provision',
      actorEmail: body.actorEmail,
      payloadSummary: `Provision idempotent：factory-support 已存在（${existing.email}）`,
      relatedUserId: existing.id,
      ...meta,
    });
    return { ok: true, initialPassword: null, alreadyProvisioned: true };
  }
  const password = generatePassword();
  const created = (await payload.create({
    collection: 'users',
    overrideAccess: true,
    context: { 'support-access-override': true },
    data: {
      email: body.email,
      password,
      role: 'factory-support',
      isFactoryManaged: true,
    },
  })) as { id: number | string };
  await writeAuditLog(payload, {
    action: 'provision',
    actorEmail: body.actorEmail,
    payloadSummary: `建立 factory-support 帳號（${body.email}）`,
    relatedUserId: created.id,
    ...meta,
  });
  return { ok: true, initialPassword: password, alreadyProvisioned: false };
}

/** handleRotate：產新密碼覆蓋。 */
export async function handleRotate(
  payload: PayloadLike,
  body: SupportAccessRotateRequest,
  meta: HandlerMeta,
): Promise<SupportAccessRotateResponse> {
  const existing = await findFactorySupportUser(payload);
  if (!existing) {
    throw new Error('factory-support 帳號不存在，請先 provision');
  }
  const password = generatePassword();
  await payload.update({
    collection: 'users',
    id: existing.id,
    overrideAccess: true,
    context: { 'support-access-override': true },
    data: { password },
  });
  await writeAuditLog(payload, {
    action: 'rotate-password',
    actorEmail: body.actorEmail,
    payloadSummary: `重設 factory-support 密碼 / 原因：${body.reason}`,
    relatedUserId: existing.id,
    ...meta,
  });
  return { ok: true, newPassword: password };
}

/** handleDisable：客戶請求停用通道（設 factoryAccessDisabledAt）。 */
export async function handleDisable(
  payload: PayloadLike,
  body: SupportAccessDisableRequest,
  meta: HandlerMeta,
): Promise<SupportAccessDisableResponse> {
  const existing = await findFactorySupportUser(payload);
  if (!existing) throw new Error('factory-support 帳號不存在');
  const now = new Date().toISOString();
  await payload.update({
    collection: 'users',
    id: existing.id,
    overrideAccess: true,
    context: { 'support-access-override': true },
    data: { factoryAccessDisabledAt: now },
  });
  await writeAuditLog(payload, {
    action: 'disable',
    actorEmail: body.actorEmail,
    payloadSummary: `停用 factory-support 通道 / 原因：${body.reason}`,
    relatedUserId: existing.id,
    ...meta,
  });
  return { ok: true, disabledAt: now };
}

/** handleEnable：清掉 factoryAccessDisabledAt。 */
export async function handleEnable(
  payload: PayloadLike,
  body: SupportAccessEnableRequest,
  meta: HandlerMeta,
): Promise<SupportAccessEnableResponse> {
  const existing = await findFactorySupportUser(payload);
  if (!existing) throw new Error('factory-support 帳號不存在');
  const now = new Date().toISOString();
  await payload.update({
    collection: 'users',
    id: existing.id,
    overrideAccess: true,
    context: { 'support-access-override': true },
    data: { factoryAccessDisabledAt: null },
  });
  await writeAuditLog(payload, {
    action: 'enable',
    actorEmail: body.actorEmail,
    payloadSummary: `恢復 factory-support 通道 / 原因：${body.reason}`,
    relatedUserId: existing.id,
    ...meta,
  });
  return { ok: true, enabledAt: now };
}

/** handleStatus：回 provisioned / disabled / lastLoginAt / monthlyAccessCount。 */
export async function handleStatus(
  payload: PayloadLike,
  _body: SupportAccessStatusRequest,
): Promise<SupportAccessStatusResponse> {
  const existing = await findFactorySupportUser(payload);
  if (!existing) {
    return {
      ok: true,
      provisioned: false,
      disabled: false,
      lastLoginAt: null,
      monthlyAccessCount: 0,
    };
  }
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const monthlyCount = await payload.count({
    collection: 'factory-support-logs',
    where: { timestamp: { greater_than_equal: monthStart.toISOString() } },
    overrideAccess: true,
  });
  const lastLogin = await payload.find({
    collection: 'factory-support-logs',
    where: { action: { equals: 'login' } },
    sort: '-timestamp',
    limit: 1,
    overrideAccess: true,
  });
  const lastLoginAt =
    lastLogin.docs[0] && typeof (lastLogin.docs[0] as { timestamp?: string }).timestamp === 'string'
      ? (lastLogin.docs[0] as { timestamp: string }).timestamp
      : null;
  return {
    ok: true,
    provisioned: true,
    disabled: Boolean(existing.factoryAccessDisabledAt),
    lastLoginAt,
    monthlyAccessCount: monthlyCount.totalDocs,
  };
}

/** handleAuditLog：分頁回傳近期紀錄（最多 100 筆）。 */
export async function handleAuditLog(
  payload: PayloadLike,
  body: SupportAccessAuditLogRequest,
): Promise<SupportAccessAuditLogResponse> {
  const limit = Math.min(100, Math.max(1, body.limit ?? 20));
  const conditions: Array<{ timestamp?: { less_than: string }; action?: { equals: string } }> = [];
  if (body.before) {
    conditions.push({ timestamp: { less_than: body.before } });
  }
  if (body.filterAction) {
    conditions.push({ action: { equals: body.filterAction } });
  }
  const res = await payload.find({
    collection: 'factory-support-logs',
    ...(conditions.length > 0 ? { where: { and: conditions } } : {}),
    sort: '-timestamp',
    limit,
    overrideAccess: true,
    depth: 0,
  });
  const entries: SupportAccessAuditEntry[] = res.docs.map((doc) => {
    const d = doc as {
      action?: string;
      actorEmail?: string;
      clientIp?: string | null;
      userAgent?: string | null;
      payloadSummary?: string;
      timestamp?: string;
    };
    return {
      action: (d.action ?? 'manual-action') as SupportAccessAuditEntry['action'],
      actorEmail: d.actorEmail ?? 'unknown',
      ...(d.clientIp ? { clientIp: d.clientIp } : {}),
      ...(d.userAgent ? { userAgent: d.userAgent } : {}),
      payloadSummary: d.payloadSummary ?? '',
      timestamp: d.timestamp ?? new Date(0).toISOString(),
    };
  });
  const last = entries[entries.length - 1];
  const hasMore = entries.length === limit;
  return {
    ok: true,
    entries,
    nextCursor: hasMore && last ? last.timestamp : null,
    totalEstimate: res.totalDocs > 1000 ? 1000 : res.totalDocs,
  };
}

/**
 * IP 去敏化（IPv4 /24、IPv6 /48）。
 * route.ts 共用本 helper，避免兩處重複實作。
 */
export function sanitizeIp(raw: string | null): string | undefined {
  if (!raw) return undefined;
  const first = raw.split(',')[0]?.trim();
  if (!first) return undefined;
  if (first.includes('.')) {
    const parts = first.split('.');
    if (parts.length === 4) return `${parts[0]}.${parts[1]}.${parts[2]}.0/24`;
  }
  if (first.includes(':')) {
    const parts = first.split(':');
    if (parts.length >= 3) return `${parts[0]}:${parts[1]}:${parts[2]}::/48`;
  }
  return undefined;
}
