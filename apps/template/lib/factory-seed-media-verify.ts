import { verifyRequest } from '@saas-factory/factory-hmac';

/**
 * Seed-media route 接收的 body shape（與 factory app 的 MediaIngestor 對齊）。
 *
 * 用途：generator `generate-images` step 在工廠端生圖後，把圖 bytes 推進客戶站建 Media doc。
 * 生圖 API key 全程留在工廠端，不隨站交付（對應 user 2026-05-29「不要 key 被帶走」）。
 */
export interface SeedMediaBody {
  /** 多租戶 id（demo 站用 subdomain）。 */
  tenantId: string;
  /** 替代文字（無障礙 + SEO；也當 Media.alt）。 */
  alt: string;
  /** base64 編碼的圖片 bytes（不含 data: 前綴）。 */
  b64: string;
  /** MIME 類型，如 `image/png` / `image/webp`。 */
  mimeType: string;
  /** 檔名（含副檔名），保證該 tenant 內唯一。 */
  filename: string;
}

/** Verify 失敗原因。 */
export type SeedMediaVerifyError =
  | { ok: false; reason: 'config-missing'; message: string }
  | { ok: false; reason: 'headers-missing'; message: string }
  | { ok: false; reason: 'hmac-malformed'; message: string }
  | { ok: false; reason: 'hmac-expired'; message: string }
  | { ok: false; reason: 'hmac-mismatch'; message: string }
  | { ok: false; reason: 'body-invalid'; message: string };

/** Verify 成功。 */
export interface SeedMediaVerifyOk {
  ok: true;
  body: SeedMediaBody;
}

/**
 * 驗證 factory → template seed-media 請求。
 *
 * 機制與 seed-pages / bootstrap-admin 同：共用 FACTORY_BOOTSTRAP_SECRET、HMAC 簽章 +
 * 5 分鐘時間漂移、fail-closed（未設 secret 直接拒）。抽出驗章層以便純 unit test。
 */
export function verifySeedMediaRequest(input: {
  secret: string | undefined;
  method: string;
  path: string;
  rawBody: string;
  headers: { timestamp: string | null; signature: string | null };
  now?: number;
}): SeedMediaVerifyOk | SeedMediaVerifyError {
  if (!input.secret) {
    return {
      ok: false,
      reason: 'config-missing',
      message: 'FACTORY_BOOTSTRAP_SECRET 未設定，seed-media endpoint 不開放',
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
  if (!isSeedMediaBody(parsed)) {
    return {
      ok: false,
      reason: 'body-invalid',
      message: 'body 結構錯誤（缺 tenantId / alt / b64 / mimeType / filename）',
    };
  }
  return { ok: true, body: parsed };
}

/** 嚴格 body shape 驗證。 */
function isSeedMediaBody(value: unknown): value is SeedMediaBody {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  if (typeof v.tenantId !== 'string' || v.tenantId.length === 0) return false;
  if (typeof v.alt !== 'string') return false;
  if (typeof v.b64 !== 'string' || v.b64.length === 0) return false;
  if (typeof v.mimeType !== 'string' || v.mimeType.length === 0) return false;
  if (typeof v.filename !== 'string' || v.filename.length === 0) return false;
  return true;
}
