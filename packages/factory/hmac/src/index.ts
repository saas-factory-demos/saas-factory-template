import { createHmac, timingSafeEqual } from 'node:crypto';

/** 預設容許的時間漂移（秒）。 */
export const DEFAULT_SKEW_SECONDS = 5 * 60;

/** 簽章用 payload。 */
export interface SignPayload {
  method: string;
  /** path（不含 query）。 */
  path: string;
  /** 請求 body 字串（沒有則空字串）。 */
  body: string;
  /** 時間戳（秒，integer）。 */
  timestamp: number;
}

/** 用於驗證的請求資訊。 */
export interface VerifyInput extends SignPayload {
  signature: string;
}

/** 用 secret 對 canonical 字串簽章（base64url 不 pad）。 */
export function signRequest(secret: string, payload: SignPayload): string {
  const canonical = canonicalize(payload);
  const hmac = createHmac('sha256', secret);
  hmac.update(canonical);
  return hmac.digest('base64url');
}

/** 驗證請求；非法格式 / 過時 / 不一致 → 回傳 reject 物件。 */
export function verifyRequest(
  secret: string,
  input: VerifyInput,
  options: { now?: number; skewSeconds?: number } = {},
): { ok: true } | { ok: false; reason: 'malformed' | 'expired' | 'mismatch' } {
  if (!input.signature) return { ok: false, reason: 'malformed' };
  if (!Number.isFinite(input.timestamp)) return { ok: false, reason: 'malformed' };
  const now = options.now ?? Math.floor(Date.now() / 1000);
  const skew = options.skewSeconds ?? DEFAULT_SKEW_SECONDS;
  if (Math.abs(now - input.timestamp) > skew) return { ok: false, reason: 'expired' };
  const expected = signRequest(secret, input);
  // 同長度才能 timingSafeEqual
  const a = Buffer.from(expected);
  const b = Buffer.from(input.signature);
  if (a.length !== b.length) return { ok: false, reason: 'mismatch' };
  if (!timingSafeEqual(a, b)) return { ok: false, reason: 'mismatch' };
  return { ok: true };
}

/** 標準化字串（避免換行或 header 順序影響）。 */
function canonicalize(p: SignPayload): string {
  return [p.method.toUpperCase(), p.path, p.timestamp, p.body].join('\n');
}
