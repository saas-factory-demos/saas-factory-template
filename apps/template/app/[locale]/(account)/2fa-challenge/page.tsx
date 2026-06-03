import { TotpChallenge } from './totp-challenge.client.js';

/**
 * /[locale]/2fa-challenge
 *
 * 登入後第二步：owner/admin 帳號通過密碼登入後，middleware 把進 /admin/* 的請求
 * 導到本頁。使用者輸入 TOTP 6 位數 → 呼叫 /api/auth/totp/login-verify。
 *
 * 驗證成功後伺服端會 Set-Cookie sf-totp-session，client 拿到 ok=true 自行 window.location 回原本路徑。
 *
 * 此頁不檢登入狀態：未登入者沒有 payload-token cookie，middleware 不會把他導到這裡。
 */
export default function Page({ searchParams }: { searchParams?: { next?: string } }) {
  const next = typeof searchParams?.next === 'string' ? searchParams.next : '/admin';
  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">兩步驟驗證</h1>
        <p className="mt-2 text-sm text-black/60">
          輸入驗證 App 上的 6 位數驗證碼。owner / admin 進入後台前必須完成。
        </p>
      </header>
      <TotpChallenge nextPath={next} />
    </main>
  );
}
