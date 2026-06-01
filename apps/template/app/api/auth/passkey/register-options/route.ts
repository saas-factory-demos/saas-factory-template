import config from '@payload-config';
import { buildRegistrationOptions } from '@saas-factory/auth';
import { getPayload } from 'payload';

import {
  CHALLENGE_COOKIE_NAME,
  issueChallenge,
} from '@/lib/security/webauthn-challenge';
import { getWebAuthnConfig } from '@/lib/security/webauthn-config';

/**
 * POST /api/auth/passkey/register-options
 *
 * 已登入 user 啟動 Passkey 註冊。回傳 `PublicKeyCredentialCreationOptionsJSON`，
 * 同時 set httpOnly 簽章 cookie 暫存 challenge，60 秒內 verify 階段要送回。
 */
export async function POST(request: Request): Promise<Response> {
  const cfg = getWebAuthnConfig();
  if (!cfg) {
    return Response.json(
      { ok: false, error: 'WebAuthn 未設定（缺 WEBAUTHN_* env）' },
      { status: 503 },
    );
  }
  const challengeSecret = process.env.WEBAUTHN_CHALLENGE_SECRET;
  if (!challengeSecret) {
    return Response.json(
      { ok: false, error: 'WEBAUTHN_CHALLENGE_SECRET 未設定' },
      { status: 503 },
    );
  }

  const payload = await getPayload({ config });
  const authResult = await payload.auth({ headers: request.headers });
  const user = authResult.user;
  if (!user) {
    return Response.json({ ok: false, error: 'unauthenticated' }, { status: 401 });
  }

  // 取已註冊憑證以排除（避免同把 key 重註冊）
  const existing = await payload.find({
    collection: 'user-credentials',
    where: { user: { equals: user.id } },
    limit: 100,
  });
  const existingCredentialIds = existing.docs
    .map((d) => (d as { credentialId?: string }).credentialId)
    .filter((v): v is string => typeof v === 'string');

  const userIdStr = String(user.id);
  const email = (user as { email?: string }).email ?? userIdStr;
  const options = await buildRegistrationOptions(cfg, {
    userId: userIdStr,
    userName: email,
    userDisplayName: email,
    existingCredentialIds,
  });

  const { cookieValue } = issueChallenge(challengeSecret, {
    userId: userIdStr,
    purpose: 'register',
  });
  // 用 server-side state 簽 challenge cookie 取代回傳 options.challenge 對齊。
  // 重要：覆寫 options.challenge 為 cookie 內存的同一份。
  // SimpleWebAuthn 預設自簽，我們改用自己的 challenge 串接 cookie 機制。
  // → 簡化：保留 options.challenge，cookie 內 challenge 必須跟 options 一致。
  // 為此先取出 cookie 內 challenge 反寫到 options。
  const challengeFromCookie = decodeChallengeFromCookie(cookieValue);
  options.challenge = challengeFromCookie;

  return Response.json(
    { ok: true, options },
    {
      headers: {
        'set-cookie': buildCookie(cookieValue),
      },
    },
  );
}

function decodeChallengeFromCookie(cookieValue: string): string {
  const [body] = cookieValue.split('.');
  const payload = JSON.parse(Buffer.from(body ?? '', 'base64url').toString('utf8')) as {
    challenge: string;
  };
  return payload.challenge;
}

function buildCookie(value: string): string {
  return [
    `${CHALLENGE_COOKIE_NAME}=${value}`,
    'Path=/api/auth/passkey',
    'HttpOnly',
    'SameSite=Strict',
    'Secure',
    'Max-Age=60',
  ].join('; ');
}
