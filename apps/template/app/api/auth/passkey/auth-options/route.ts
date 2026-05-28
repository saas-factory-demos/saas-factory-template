import config from '@payload-config';
import { buildAuthenticationOptions } from '@saas-factory/auth';
import { getPayload } from 'payload';

import {
  CHALLENGE_COOKIE_NAME,
  issueChallenge,
} from '@/lib/security/webauthn-challenge';
import { getWebAuthnConfig } from '@/lib/security/webauthn-config';

/**
 * POST /api/auth/passkey/auth-options
 *
 * 已登入 user 觸發 step-up 驗證（例：進入高敏感頁面前再要求 Passkey）。
 * 回 `PublicKeyCredentialRequestOptionsJSON` + set challenge cookie。
 */
export async function POST(request: Request): Promise<Response> {
  const cfg = getWebAuthnConfig();
  if (!cfg) {
    return Response.json({ ok: false, error: 'WebAuthn 未設定' }, { status: 503 });
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

  const existing = await payload.find({
    collection: 'user-credentials',
    where: { user: { equals: user.id } },
    limit: 100,
  });
  if (existing.docs.length === 0) {
    return Response.json(
      { ok: false, error: '無已註冊 Passkey，請先註冊' },
      { status: 400 },
    );
  }

  type AllowCred = Parameters<typeof buildAuthenticationOptions>[1]['allowCredentials'][number];
  const allowCredentials: AllowCred[] = [];
  for (const d of existing.docs) {
    const doc = d as { credentialId?: unknown; transports?: unknown };
    if (typeof doc.credentialId !== 'string') continue;
    allowCredentials.push({
      id: doc.credentialId,
      transports: Array.isArray(doc.transports)
        ? (doc.transports as AllowCred['transports'])
        : undefined,
    });
  }

  const options = await buildAuthenticationOptions(cfg, { allowCredentials });

  const { cookieValue } = issueChallenge(challengeSecret, {
    userId: String(user.id),
    purpose: 'authenticate',
  });
  // 同 register：把 options.challenge 改成 cookie 內的同一份
  const [body] = cookieValue.split('.');
  const decoded = JSON.parse(
    Buffer.from(body ?? '', 'base64url').toString('utf8'),
  ) as { challenge: string };
  options.challenge = decoded.challenge;

  return Response.json(
    { ok: true, options },
    {
      headers: {
        'set-cookie': [
          `${CHALLENGE_COOKIE_NAME}=${cookieValue}`,
          'Path=/api/auth/passkey',
          'HttpOnly',
          'SameSite=Strict',
          'Secure',
          'Max-Age=60',
        ].join('; '),
      },
    },
  );
}
