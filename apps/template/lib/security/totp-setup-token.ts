import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * TOTP setup 短期 token。
 *
 * 為何用 signed cookie：setup-init 產的 base32 secret + 10 組 recovery codes
 * 在使用者輸入第一個 TOTP 驗證碼前不可寫進 DB（避免半完成狀態污染 user）。
 *
 * 流程：
 * 1. setup-init：產 secret / otpauthUrl / recoveryCodes → cookie 簽存 secret + codes
 * 2. setup-verify：cookie 解出 secret，validate 使用者輸入的 6 位數，pass 才寫 DB
 *
 * 安全性：
 * - HMAC SHA-256 簽章（fail-closed 未設 secret 直拒）
 * - 10 分鐘硬過期（夠掃 QR + 開 authenticator 抄碼）
 * - `timingSafeEqual` 常數時間比對
 */

export const TOTP_SETUP_COOKIE_NAME = 'sf-totp-setup';
const TOTP_SETUP_MAX_AGE_MS = 10 * 60 * 1000;

export interface TotpSetupPayload {
  userId: string;
  /** base32 secret，verify 後才寫進 user.totpSecret */
  secret: string;
  /** 明碼 recovery codes，verify 後 hash 過才寫 user.recoveryCodes */
  recoveryCodes: string[];
  iat: number;
}

export function issueTotpSetupToken(
  secret: string,
  input: { userId: string; totpSecret: string; recoveryCodes: string[] },
): string {
  if (!secret) {
    throw new Error('TOTP_SETUP_SECRET 未設定');
  }
  const payload: TotpSetupPayload = {
    userId: input.userId,
    secret: input.totpSecret,
    recoveryCodes: input.recoveryCodes,
    iat: Date.now(),
  };
  const body = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = sign(secret, body);
  return `${body}.${sig}`;
}

export function verifyTotpSetupToken(
  secret: string,
  cookieValue: string | undefined,
  expected: { userId: string; now?: number },
): TotpSetupPayload | null {
  if (!secret || !cookieValue) return null;
  const parts = cookieValue.split('.');
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  if (!body || !sig) return null;

  const expectedSig = sign(secret, body);
  const sigBuf = Buffer.from(sig, 'utf8');
  const expectedBuf = Buffer.from(expectedSig, 'utf8');
  if (sigBuf.length !== expectedBuf.length) return null;
  if (!timingSafeEqual(sigBuf, expectedBuf)) return null;

  let payload: TotpSetupPayload;
  try {
    payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as TotpSetupPayload;
  } catch {
    return null;
  }
  if (typeof payload !== 'object' || payload === null) return null;
  if (typeof payload.userId !== 'string') return null;
  if (typeof payload.secret !== 'string') return null;
  if (!Array.isArray(payload.recoveryCodes)) return null;
  if (!payload.recoveryCodes.every((c) => typeof c === 'string')) return null;
  if (typeof payload.iat !== 'number') return null;

  if (payload.userId !== expected.userId) return null;
  const now = expected.now ?? Date.now();
  if (now - payload.iat > TOTP_SETUP_MAX_AGE_MS) return null;

  return payload;
}

function sign(secret: string, body: string): string {
  return createHmac('sha256', secret).update(body).digest().toString('base64url');
}
