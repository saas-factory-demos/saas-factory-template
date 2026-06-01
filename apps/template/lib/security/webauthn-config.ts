import type { WebAuthnConfig } from '@saas-factory/auth';

/**
 * 從 env 組裝 WebAuthn RP 設定。
 *
 * env 對齊：
 * - `WEBAUTHN_RP_NAME`：顯示名稱（例：'SaaS Factory Admin'）
 * - `WEBAUTHN_RP_ID`：domain（例：'admin.example.com'）
 * - `WEBAUTHN_ORIGIN`：完整 URL（例：'https://admin.example.com'）
 *
 * 全未設 → null，呼叫端應回 503（功能未啟用）。
 */
export function getWebAuthnConfig(): WebAuthnConfig | null {
  const rpName = process.env.WEBAUTHN_RP_NAME;
  const rpId = process.env.WEBAUTHN_RP_ID;
  const origin = process.env.WEBAUTHN_ORIGIN;
  if (!rpName || !rpId || !origin) return null;
  return { rpName, rpId, origin };
}
