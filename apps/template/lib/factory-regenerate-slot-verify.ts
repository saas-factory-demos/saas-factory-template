import { verifyRequest } from '@saas-factory/factory-hmac';

/**
 * Regenerate-slot route 接收的 body shape。
 *
 * 用途：goal-12 新策略——初次生站時每位置只生 1 張（成本低）；事後 owner 對某張不滿意，
 * 工廠端用工廠的 OpenAI key 重新生一張，把 bytes 推進客戶站建立新 Media doc，
 * 並把該頁 layout 對應 block 的 image 欄位指到新 mediaId。生圖 key 不隨站交付。
 *
 * `path` 指向 block.config 內到 image asset 的路徑（與 generator collectImageSlots 一致）；
 * 端點走訪 path 把對應位置寫成新 mediaId，避免動其它欄位。
 */
export interface RegenerateSlotBody {
  /** 多租戶 id（demo 站用 subdomain）。 */
  tenantId: string;
  /** 頁面 slug（homepage 寫 'home'，其餘走 pageKey）。 */
  pageSlug: string;
  /** block.id（與 wizard 的 block id 一致）。 */
  blockId: string;
  /** block.config 內到 image 位置的路徑，例 `['items', 0, 'image']`。 */
  path: Array<string | number>;
  /** 新圖 alt 文字。 */
  alt: string;
  /** base64 圖片 bytes（不含 data: 前綴）。 */
  b64: string;
  /** MIME 類型，如 `image/png`。 */
  mimeType: string;
  /** 檔名（含副檔名），須與既有 Media 不撞，建議帶時間戳。 */
  filename: string;
}

/** Verify 失敗原因。 */
export type RegenerateSlotVerifyError =
  | { ok: false; reason: 'config-missing'; message: string }
  | { ok: false; reason: 'headers-missing'; message: string }
  | { ok: false; reason: 'hmac-malformed'; message: string }
  | { ok: false; reason: 'hmac-expired'; message: string }
  | { ok: false; reason: 'hmac-mismatch'; message: string }
  | { ok: false; reason: 'body-invalid'; message: string };

/** Verify 成功。 */
export interface RegenerateSlotVerifyOk {
  ok: true;
  body: RegenerateSlotBody;
}

/**
 * 驗證 factory → template regenerate-slot 請求。
 *
 * 機制與 seed-media / seed-pages 同：共用 FACTORY_BOOTSTRAP_SECRET、HMAC + 5 分鐘時間漂移、
 * fail-closed。抽出驗章層讓純 unit test 可走完所有拒絕分支。
 */
export function verifyRegenerateSlotRequest(input: {
  secret: string | undefined;
  method: string;
  path: string;
  rawBody: string;
  headers: { timestamp: string | null; signature: string | null };
  now?: number;
}): RegenerateSlotVerifyOk | RegenerateSlotVerifyError {
  if (!input.secret) {
    return {
      ok: false,
      reason: 'config-missing',
      message: 'FACTORY_BOOTSTRAP_SECRET 未設定，regenerate-slot endpoint 不開放',
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
    return { ok: false, reason: 'hmac-malformed', message: 'x-factory-timestamp 非合法數字' };
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
  if (!isRegenerateSlotBody(parsed)) {
    return {
      ok: false,
      reason: 'body-invalid',
      message: 'body 結構錯誤（檢查 tenantId / pageSlug / blockId / path[] / alt / b64 / mimeType / filename）',
    };
  }
  return { ok: true, body: parsed };
}

/** 嚴格 body shape 驗證。 */
function isRegenerateSlotBody(value: unknown): value is RegenerateSlotBody {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  if (typeof v.tenantId !== 'string' || v.tenantId.length === 0) return false;
  if (typeof v.pageSlug !== 'string' || v.pageSlug.length === 0) return false;
  if (typeof v.blockId !== 'string' || v.blockId.length === 0) return false;
  if (!Array.isArray(v.path) || v.path.length === 0) return false;
  if (!v.path.every((p) => typeof p === 'string' || typeof p === 'number')) return false;
  if (typeof v.alt !== 'string') return false;
  if (typeof v.b64 !== 'string' || v.b64.length === 0) return false;
  if (typeof v.mimeType !== 'string' || v.mimeType.length === 0) return false;
  if (typeof v.filename !== 'string' || v.filename.length === 0) return false;
  return true;
}
