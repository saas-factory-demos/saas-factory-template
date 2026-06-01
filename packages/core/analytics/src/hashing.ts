import { createHash } from 'node:crypto';

/**
 * Meta CAPI 要求 email/phone 等 PII 用 SHA-256 雜湊送出。
 *
 * 規則：
 * - email：lowercase + trim
 * - phone：去除所有非數字
 */
export function hashEmail(email: string): string {
  return sha256(email.trim().toLowerCase());
}

export function hashPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return sha256(digits);
}

export function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}
