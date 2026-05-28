import config from '@payload-config';
import { verifyAuthentication } from '@saas-factory/auth';
import { getPayload } from 'payload';

import {
  CHALLENGE_COOKIE_NAME,
  verifyChallenge,
} from '@/lib/security/webauthn-challenge';
import { getWebAuthnConfig } from '@/lib/security/webauthn-config';

/**
 * POST /api/auth/passkey/auth-verify
 *
 * 接收 client 端 `navigator.credentials.get` 完成後的 `AuthenticationResponseJSON`。
 * 驗證簽章 + challenge → 更新 counter（防 replay）+ 回 step-up 通過。
 *
 * body shape: `{ response: AuthenticationResponseJSON }`
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
  const verifiedChallenge = verifyChallenge(challengeSecret, cookie, {
    userId: String(user.id),
    purpose: 'authenticate',
  });
  if (!verifiedChallenge) {
    return Response.json(
      { ok: false, error: 'challenge 過期或不存在' },
      { status: 400 },
    );
  }

  let body: { response?: unknown };
  try {
    body = (await request.json()) as { response?: unknown };
  } catch {
    return Response.json({ ok: false, error: 'body 非 JSON' }, { status: 400 });
  }
  if (!body.response || typeof body.response !== 'object') {
    return Response.json({ ok: false, error: '缺 response 欄位' }, { status: 400 });
  }
  const credentialId = (body.response as { id?: unknown }).id;
  if (typeof credentialId !== 'string') {
    return Response.json({ ok: false, error: 'response.id 缺失' }, { status: 400 });
  }

  const found = await payload.find({
    collection: 'user-credentials',
    where: {
      and: [
        { user: { equals: user.id } },
        { credentialId: { equals: credentialId } },
      ],
    },
    limit: 1,
  });
  const credentialDoc = found.docs[0] as
    | {
        id: string | number;
        publicKey: string;
        counter: number;
        transports?: unknown;
      }
    | undefined;
  if (!credentialDoc) {
    return Response.json(
      { ok: false, error: '找不到對應的 Passkey 憑證' },
      { status: 404 },
    );
  }

  const publicKey = new Uint8Array(Buffer.from(credentialDoc.publicKey, 'base64url'));

  let result;
  try {
    result = await verifyAuthentication(cfg, {
      expectedChallenge: verifiedChallenge.challenge,
      response: body.response as Parameters<typeof verifyAuthentication>[1]['response'],
      credential: {
        id: credentialId,
        publicKey,
        counter: credentialDoc.counter,
      },
    });
  } catch (err) {
    return Response.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : 'verify failed',
      },
      { status: 400 },
    );
  }
  if (!result.verified) {
    return Response.json({ ok: false, error: '簽章驗證未通過' }, { status: 400 });
  }

  // counter 必須遞增；否則可能 replay
  const newCounter = result.authenticationInfo.newCounter;
  if (newCounter <= credentialDoc.counter && credentialDoc.counter !== 0) {
    return Response.json(
      { ok: false, error: 'counter 未遞增，疑似 replay attack' },
      { status: 401 },
    );
  }

  await payload.update({
    collection: 'user-credentials',
    id: credentialDoc.id,
    data: {
      counter: newCounter,
      lastUsedAt: new Date().toISOString(),
    },
  });

  return Response.json(
    { ok: true, credentialId },
    {
      headers: {
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
