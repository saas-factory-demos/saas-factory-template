import { verifyRequest } from '@saas-factory/factory-hmac';

/**
 * Bootstrap-admin route 接收的 body shape（與 factory app 的 BootstrapBody 對齊）。
 */
export interface BootstrapBody {
  adminEmail: string;
  adminPassword: string;
  client: { clientName: string; brandName: string };
}

/** Verify 失敗原因。 */
export type BootstrapVerifyError =
  | { ok: false; reason: 'config-missing'; message: string }
  | { ok: false; reason: 'headers-missing'; message: string }
  | { ok: false; reason: 'hmac-malformed'; message: string }
  | { ok: false; reason: 'hmac-expired'; message: string }
  | { ok: false; reason: 'hmac-mismatch'; message: string }
  | { ok: false; reason: 'body-invalid'; message: string };

/** Verify 成功。 */
export interface BootstrapVerifyOk {
  ok: true;
  body: BootstrapBody;
}

/**
 * 驗證 factory → template bootstrap 請求：
 * 1. secret 必填（fail-closed，未設不允許開放此 API）
 * 2. headers 完整（x-factory-timestamp / x-factory-signature）
 * 3. HMAC 簽章正確 + 時間漂移 <= DEFAULT_SKEW_SECONDS（5 分鐘）
 * 4. body 結構合法（adminEmail / adminPassword / client）
 *
 * 為何拆獨立 helper：route handler 依賴 getPayload runtime，難 unit test；驗章邏輯抽出
 * 可純 unit test 走完所有 reject 分支。
 */
export function verifyBootstrapRequest(input: {
  secret: string | undefined;
  method: string;
  path: string;
  rawBody: string;
  headers: { timestamp: string | null; signature: string | null };
  now?: number;
}): BootstrapVerifyOk | BootstrapVerifyError {
  if (!input.secret) {
    return {
      ok: false,
      reason: 'config-missing',
      message: 'FACTORY_BOOTSTRAP_SECRET 未設定，bootstrap-admin endpoint 不開放',
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
  if (!isBootstrapBody(parsed)) {
    return {
      ok: false,
      reason: 'body-invalid',
      message: 'body 結構錯誤（缺 adminEmail / adminPassword / client）',
    };
  }
  return { ok: true, body: parsed };
}

function isBootstrapBody(value: unknown): value is BootstrapBody {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  if (typeof v.adminEmail !== 'string' || v.adminEmail.length === 0) return false;
  if (typeof v.adminPassword !== 'string' || v.adminPassword.length < 8) return false;
  if (!v.client || typeof v.client !== 'object') return false;
  const c = v.client as Record<string, unknown>;
  if (typeof c.clientName !== 'string' || c.clientName.length === 0) return false;
  if (typeof c.brandName !== 'string' || c.brandName.length === 0) return false;
  return true;
}
