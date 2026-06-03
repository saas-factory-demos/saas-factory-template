import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

/**
 * WebAuthn challenge 短期存放機制。
 *
 * 流程要求 server 在 register-options / auth-options 階段產生 challenge，
 * client 簽完後在 verify 階段送回，server 需比對「同一個 challenge」。
 *
 * 為何用 signed cookie 而非 DB：
 * - challenge 只活幾秒到一分鐘，丟 DB 多此一舉、要清表
 * - signed cookie 只信本 server，內含 challenge + userId + iat + 簽章
 *
 * 安全性：
 * - HMAC SHA-256 簽章用 `WEBAUTHN_CHALLENGE_SECRET`（fail-closed，未設不允許）
 * - 60 秒過期硬上限，超過 reject
 * - `timingSafeEqual` 常數時間比對簽章
 */

export const CHALLENGE_COOKIE_NAME = 'sf-webauthn-challenge';
const CHALLENGE_MAX_AGE_MS = 60_000;

export interface ChallengePayload {
  challenge: string;
  userId: string;
  /** 'register' | 'authenticate' — 防混用：註冊產生的 challenge 不該被 verify-authentication 接受 */
  purpose: 'register' | 'authenticate';
  /** Issued at（ms epoch） */
  iat: number;
}

/**
 * 產 challenge + 序列化成簽章 cookie 值。
 *
 * Cookie 值格式：`base64url(json)` + `.` + `base64url(hmac)`。
 */
export function issueChallenge(
  secret: string,
  input: { userId: string; purpose: ChallengePayload['purpose'] },
): { challenge: string; cookieValue: string } {
  if (!secret) {
    throw new Error('WEBAUTHN_CHALLENGE_SECRET 未設定');
  }
  const challenge = base64Url(randomBytes(32));
  const payload: ChallengePayload = {
    challenge,
    userId: input.userId,
    purpose: input.purpose,
    iat: Date.now(),
  };
  const body = base64Url(Buffer.from(JSON.stringify(payload), 'utf8'));
  const sig = sign(secret, body);
  return { challenge, cookieValue: `${body}.${sig}` };
}

/**
 * 驗證並解析 challenge cookie。回 payload 或 null（簽章錯 / 過期 / 格式錯）。
 */
export function verifyChallenge(
  secret: string,
  cookieValue: string | undefined,
  expected: { userId: string; purpose: ChallengePayload['purpose']; now?: number },
): ChallengePayload | null {
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

  let payload: ChallengePayload;
  try {
    payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as ChallengePayload;
  } catch {
    return null;
  }
  if (typeof payload !== 'object' || payload === null) return null;
  if (typeof payload.challenge !== 'string') return null;
  if (typeof payload.userId !== 'string') return null;
  if (payload.purpose !== 'register' && payload.purpose !== 'authenticate') return null;
  if (typeof payload.iat !== 'number') return null;

  if (payload.userId !== expected.userId) return null;
  if (payload.purpose !== expected.purpose) return null;

  const now = expected.now ?? Date.now();
  if (now - payload.iat > CHALLENGE_MAX_AGE_MS) return null;

  return payload;
}

function sign(secret: string, body: string): string {
  return base64Url(createHmac('sha256', secret).update(body).digest());
}

function base64Url(buf: Buffer): string {
  return buf.toString('base64url');
}
