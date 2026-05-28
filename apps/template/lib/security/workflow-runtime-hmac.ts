import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Workflow runtime endpoint 的 HMAC 簽章工具。
 *
 * 從 /api/workflows/executions 抽出，方便單測 + 給 factory client 端複用。
 */

export function signWorkflowRuntimeBody(secret: string, rawBody: string): string {
  if (!secret) throw new Error('secret 未設定');
  return createHmac('sha256', secret).update(`${secret}:${rawBody}`).digest('hex');
}

export function verifyWorkflowRuntimeSignature(
  secret: string,
  rawBody: string,
  providedHex: string,
): boolean {
  if (!secret) return false;
  if (!/^[0-9a-f]+$/i.test(providedHex)) return false;
  const expected = signWorkflowRuntimeBody(secret, rawBody);
  const a = Buffer.from(providedHex.toLowerCase(), 'utf8');
  const b = Buffer.from(expected, 'utf8');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
