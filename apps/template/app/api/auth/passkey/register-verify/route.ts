import config from '@payload-config';
import { verifyRegistration } from '@saas-factory/auth';
import { getPayload } from 'payload';

import {
  CHALLENGE_COOKIE_NAME,
  verifyChallenge,
} from '@/lib/security/webauthn-challenge';
import { getWebAuthnConfig } from '@/lib/security/webauthn-config';

/**
 * POST /api/auth/passkey/register-verify
 *
 * 接收 client 端 `navigator.credentials.create` 完成後的 `RegistrationResponseJSON` +
 * 暱稱（選填）。驗證簽章 + challenge cookie 一致 → 寫進 user-credentials collection。
 *
 * body shape:
 * ```
 * { response: RegistrationResponseJSON, nickname?: string }
 * ```
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

  const cookie = readCookie(request.headers.get('cookie'), CHALLENGE_COOKIE_NAME);
  const verified = verifyChallenge(challengeSecret, cookie, {
    userId: String(user.id),
    purpose: 'register',
  });
  if (!verified) {
    return Response.json(
      { ok: false, error: 'challenge 過期或不存在，請重新開始註冊' },
      { status: 400 },
    );
  }

  let body: { response?: unknown; nickname?: unknown };
  try {
    body = (await request.json()) as { response?: unknown; nickname?: unknown };
  } catch {
    return Response.json({ ok: false, error: 'body 非 JSON' }, { status: 400 });
  }
  if (!body.response || typeof body.response !== 'object') {
    return Response.json({ ok: false, error: '缺 response 欄位' }, { status: 400 });
  }

  let result;
  try {
    result = await verifyRegistration(cfg, {
      expectedChallenge: verified.challenge,
      response: body.response as Parameters<typeof verifyRegistration>[1]['response'],
    });
  } catch (err) {
    return Response.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : 'verifyRegistration failed',
      },
      { status: 400 },
    );
  }
  if (!result.verified || !result.registrationInfo) {
    return Response.json({ ok: false, error: '簽章驗證未通過' }, { status: 400 });
  }

  const { credential } = result.registrationInfo;
  const credentialId = credential.id;
  const publicKey = Buffer.from(credential.publicKey).toString('base64url');
  const counter = credential.counter;
  const transports = credential.transports ?? null;

  try {
    await payload.create({
      collection: 'user-credentials',
      data: {
        user: user.id,
        credentialId,
        publicKey,
        counter,
        transports,
        nickname:
          typeof body.nickname === 'string' && body.nickname.length > 0
            ? body.nickname
            : '未命名 Passkey',
      },
    });
  } catch (err) {
    return Response.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : 'create failed',
      },
      { status: 500 },
    );
  }

  return Response.json(
    { ok: true, credentialId },
    {
      headers: {
        // 清掉 challenge cookie（已用過）
        'set-cookie': `${CHALLENGE_COOKIE_NAME}=; Path=/api/auth/passkey; Max-Age=0; HttpOnly; SameSite=Strict; Secure`,
      },
    },
  );
}

function readCookie(header: string | null, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const [k, ...rest] = part.trim().split('=');
    if (k === name) return rest.join('=');
  }
  return undefined;
}
