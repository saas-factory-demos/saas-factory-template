import { TOTP_SESSION_COOKIE_NAME } from '@/lib/security/totp-session-cookie-name';

/**
 * POST /api/auth/logout
 *
 * 包一層 Payload 登出 + 清掉 `sf-totp-session` cookie，避免下次登入直接被認定已過 2FA。
 *
 * 為何需要：Payload 的 /api/users/logout 只清 `payload-token`，不知道 sf-totp-session 的存在。
 * 若不清，使用者登出後在同瀏覽器重新登入（同 userId），舊 cookie 仍能讓 middleware 放行。
 *
 * 流程：
 * 1. 轉發 cookie 給 Payload 登出（內部 fetch）
 * 2. 不論 Payload 結果如何，回傳時都清 `sf-totp-session`（fail-safe：盡力清）
 *
 * 回傳：`{ ok: true }` + `Set-Cookie: sf-totp-session=;` + `Set-Cookie: payload-token=;`
 */
export async function POST(request: Request): Promise<Response> {
  const cookie = request.headers.get('cookie') ?? '';
  const proto = request.headers.get('x-forwarded-proto') ?? 'http';
  const host = request.headers.get('host') ?? 'localhost';
  const base = `${proto}://${host}`;

  // 轉發給 Payload 自家 logout（best-effort，失敗不影響本 endpoint 清 cookie）
  try {
    await fetch(`${base}/api/users/logout`, {
      method: 'POST',
      headers: { cookie, 'Content-Type': 'application/json' },
    });
  } catch {
    // 忽略：本端點重點是清 sf-totp-session
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const clearAttrs = (name: string): string => {
    const attrs = [`${name}=`, 'Path=/', 'HttpOnly', 'SameSite=Strict', 'Max-Age=0'];
    if (isProduction) attrs.push('Secure');
    return attrs.join('; ');
  };

  const response = new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
  // 同時清兩個 cookie（payload 雖然會自清，但這裡多保險）
  response.headers.append('Set-Cookie', clearAttrs(TOTP_SESSION_COOKIE_NAME));
  response.headers.append('Set-Cookie', clearAttrs('payload-token'));
  return response;
}
