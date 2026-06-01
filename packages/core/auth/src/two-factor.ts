import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

import { Secret, TOTP } from 'otpauth';

/**
 * TOTP 2FA 服務（ADR-0010 §8）。
 *
 * - 用 RFC 6238 標準 30 秒視窗
 * - 6 位數驗證碼
 * - recovery codes 10 組一次性使用
 */

const ISSUER = 'SaaS Factory';

export interface TotpSetup {
  /** Base32 secret，存進 Users.totpSecret */
  secret: string;
  /** otpauth URI，產 QR code 用 */
  otpauthUrl: string;
  /** 一次性 recovery codes，存 hashed 版本 */
  recoveryCodes: string[];
}

function makeTotp(secret: Secret, label: string): TOTP {
  return new TOTP({
    issuer: ISSUER,
    label,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret,
  });
}

/**
 * 為指定 user 產一組新的 2FA 設定。
 *
 * label 通常用 user.email，會顯示在 Authenticator app 裡。
 */
export function generateTotpSetup(label: string): TotpSetup {
  const secret = new Secret({ size: 20 });
  const totp = makeTotp(secret, label);
  return {
    secret: secret.base32,
    otpauthUrl: totp.toString(),
    recoveryCodes: generateRecoveryCodes(10),
  };
}

/**
 * 驗證 6 位數 TOTP。
 *
 * `window: 1` 容許前後一個 30 秒視窗（總 90 秒），緩衝設備時間漂移。
 */
export function verifyTotp(secretBase32: string, token: string): boolean {
  try {
    const totp = makeTotp(Secret.fromBase32(secretBase32), 'verify');
    const delta = totp.validate({ token, window: 1 });
    return delta !== null;
  } catch {
    return false;
  }
}

/**
 * 產 N 組 recovery codes（XXXX-XXXX 格式）。
 */
export function generateRecoveryCodes(count: number): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    codes.push(`${randomBlock()}-${randomBlock()}`);
  }
  return codes;
}

function randomBlock(): string {
  // 用 crypto.randomBytes 取代 Math.random：救援碼是憑證等級的 secret，
  // 不能用可預測的 PRNG。32 字元集 → 5 bit/字元，4 字元 block = 20 bit。
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = randomBytes(4);
  let block = '';
  for (let i = 0; i < 4; i++) {
    block += chars.charAt(bytes[i]! % chars.length);
  }
  return block;
}

/**
 * 對 recovery code 做 sha-256 hex hash。
 *
 * 為何不用 bcrypt：recovery code 自帶高熵（160 bit，相當於 32 字元 base32），
 * 沒有暴力破解空間，hash 主要防止資料庫外洩時直接看到明碼；
 * 用 sha-256 比 bcrypt 快 1000x，等效安全。
 *
 * 為何輸入要 normalize：使用者可能手抄帶空白或大小寫差異，
 * 先 trim + uppercase + 去 dash 再 hash，與註冊時 hash 流程必須對齊。
 */
export function hashRecoveryCode(code: string): string {
  const normalized = code.replace(/[\s-]/g, '').toUpperCase();
  return createHash('sha256').update(normalized).digest('hex');
}

/**
 * 驗證 + 消耗一組 recovery code。
 *
 * - 用 `timingSafeEqual` 比對避免時序攻擊（雖然 hash 後比對也已大致 constant-time，
 *   但 Buffer compare 仍可能 early-return）
 * - 成功時回傳「剩餘 hashed codes」（呼叫端寫回 DB），失敗回 null
 * - 一次性：用過就消失，下次同一組 code 必失敗
 */
export function verifyAndConsumeRecoveryCode(
  inputCode: string,
  hashedCodes: string[],
): string[] | null {
  const target = hashRecoveryCode(inputCode);
  const targetBuf = Buffer.from(target, 'hex');
  for (let i = 0; i < hashedCodes.length; i++) {
    const candidate = hashedCodes[i]!;
    let candBuf: Buffer;
    try {
      candBuf = Buffer.from(candidate, 'hex');
    } catch {
      continue;
    }
    if (candBuf.length !== targetBuf.length) continue;
    if (timingSafeEqual(candBuf, targetBuf)) {
      return [...hashedCodes.slice(0, i), ...hashedCodes.slice(i + 1)];
    }
  }
  return null;
}
