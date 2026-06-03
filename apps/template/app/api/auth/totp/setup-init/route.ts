import config from '@payload-config';
import { generateTotpSetup } from '@saas-factory/auth';
import { getPayload } from 'payload';
import QRCode from 'qrcode';

import {
  TOTP_SETUP_COOKIE_NAME,
  issueTotpSetupToken,
} from '@/lib/security/totp-setup-token';

/**
 * POST /api/auth/totp/setup-init
 *
 * 已登入 user 啟動 TOTP 2FA 設定。
 *
 * 回傳：
 * - `secret`：base32 字串（給使用者手動輸入用）
 * - `otpauthUrl`：給前端產 QR code
 * - `recoveryCodes`：10 組明碼（**前端必須提示使用者抄寫**，後續只存 hash）
 *
 * 注意：本端點不寫進 DB；secret / recoveryCodes 暫存於 HMAC 簽章 cookie，
 * 等 setup-verify 收到正確 TOTP 才會 persist。10 分鐘過期。
 */
export async function POST(request: Request): Promise<Response> {
  const setupSecret = process.env.TOTP_SETUP_SECRET;
  if (!setupSecret) {
    return Response.json(
      { ok: false, error: 'TOTP_SETUP_SECRET 未設定' },
      { status: 503 },
    );
  }

  const payload = await getPayload({ config });
  const authResult = await payload.auth({ headers: request.headers });
  const user = authResult.user;
  if (!user) {
    return Response.json({ ok: false, error: 'unauthenticated' }, { status: 401 });
  }

  if ((user as { totpEnabled?: unknown }).totpEnabled) {
    return Response.json(
      { ok: false, error: '已啟用 2FA，請先停用後再重設' },
      { status: 409 },
    );
  }

  const email = (user as { email?: string }).email ?? String(user.id);
  const setup = generateTotpSetup(email);

  const token = issueTotpSetupToken(setupSecret, {
    userId: String(user.id),
    totpSecret: setup.secret,
    recoveryCodes: setup.recoveryCodes,
  });

  // Server-side render QR PNG dataURL：避免把 otpauthUrl + secret 經第三方 QR 服務洩漏。
  const qrDataUrl = await QRCode.toDataURL(setup.otpauthUrl, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 256,
  });

  return Response.json(
    {
      ok: true,
      secret: setup.secret,
      otpauthUrl: setup.otpauthUrl,
      qrDataUrl,
      recoveryCodes: setup.recoveryCodes,
    },
    {
      headers: {
        'set-cookie': buildCookie(token),
      },
    },
  );
}

function buildCookie(value: string): string {
  return [
    `${TOTP_SETUP_COOKIE_NAME}=${value}`,
    'Path=/api/auth/totp',
    'HttpOnly',
    'SameSite=Strict',
    'Secure',
    'Max-Age=600',
  ].join('; ');
}
