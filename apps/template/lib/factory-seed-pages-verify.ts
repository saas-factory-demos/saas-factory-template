import { verifyRequest } from '@saas-factory/factory-hmac';

import type { PageComposition } from '@saas-factory/factory-types';

/**
 * Seed-pages route 接收的 body shape（與 factory app 的 SeedPagesBody 對齊）。
 *
 * 與 bootstrap-admin 不同：此 endpoint 寫入內容資料（pages.layout），
 * 失敗影響範圍局部（admin / 其他資料不受影響），所以 fail-closed 強度與 bootstrap 相同
 * 但結構驗證僅檢查必要欄位，blocks 內部 schema 由 Payload collection 層攔截。
 */
export interface SeedPagesBody {
  tenantId: string;
  pages: PageComposition[];
}

/** Verify 失敗原因。 */
export type SeedPagesVerifyError =
  | { ok: false; reason: 'config-missing'; message: string }
  | { ok: false; reason: 'headers-missing'; message: string }
  | { ok: false; reason: 'hmac-malformed'; message: string }
  | { ok: false; reason: 'hmac-expired'; message: string }
  | { ok: false; reason: 'hmac-mismatch'; message: string }
  | { ok: false; reason: 'body-invalid'; message: string };

/** Verify 成功。 */
export interface SeedPagesVerifyOk {
  ok: true;
  body: SeedPagesBody;
}

/**
 * 驗證 factory → template seed-pages 請求。
 *
 * 機制與 bootstrap-admin 同：
 * 1. secret 必填（fail-closed）
 * 2. HMAC 簽章 + 5 分鐘時間漂移
 * 3. body 結構合法（tenantId / pages array）
 *
 * 為何拆成獨立 helper：與 bootstrap-admin 同樣考量——route 依賴 Payload runtime，
 * 抽出驗章層才能純 unit test 走完拒絕分支。
 */
export function verifySeedPagesRequest(input: {
  secret: string | undefined;
  method: string;
  path: string;
  rawBody: string;
  headers: { timestamp: string | null; signature: string | null };
  now?: number;
}): SeedPagesVerifyOk | SeedPagesVerifyError {
  if (!input.secret) {
    return {
      ok: false,
      reason: 'config-missing',
      message: 'FACTORY_BOOTSTRAP_SECRET 未設定，seed-pages endpoint 不開放',
    };
  }
  if (!input.headers.timestamp || !input.headers.signature) {
    return {
      ok: false,
      reason: 'headers-missing',
      message: '缺少 x-factory-timestamp 或 x-factory-signature header',
    };
  }
  const timestamp = Number.parseInt(input.headers.timestamp, 10);
  if (!Number.isFinite(timestamp)) {
    return {
      ok: false,
      reason: 'hmac-malformed',
      message: 'x-factory-timestamp 非合法數字',
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
    parsed = JSON.parse(input.rawBody);
  } catch {
    return { ok: false, reason: 'body-invalid', message: 'body 非合法 JSON' };
  }
  if (!isSeedPagesBody(parsed)) {
    return {
      ok: false,
      reason: 'body-invalid',
      message: 'body 結構錯誤（缺 tenantId 或 pages 非陣列）',
    };
  }
  return { ok: true, body: parsed };
}

/**
 * 嚴格的 body shape 驗證；只驗 routing 必要欄位，blocks 內部交由 collection schema。
 *
 * 為何不深驗 blocks：industry-templates 的 BlockInstance 已是經過 Zod schema 驗證的
 * 資料；又因為 type / variant / config 多樣，這層只攔最外層結構，避免重複維護驗證邏輯。
 */
function isSeedPagesBody(value: unknown): value is SeedPagesBody {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  if (typeof v.tenantId !== 'string' || v.tenantId.length === 0) return false;
  if (!Array.isArray(v.pages)) return false;
  for (const p of v.pages) {
    if (!p || typeof p !== 'object') return false;
    const page = p as Record<string, unknown>;
    if (typeof page.pageKey !== 'string' || page.pageKey.length === 0) return false;
    if (!Array.isArray(page.blocks)) return false;
  }
  return true;
}
