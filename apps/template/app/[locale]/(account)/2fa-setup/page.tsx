import { TwoFactorSetup } from './two-factor-setup.client.js';

/**
 * /[locale]/2fa-setup
 *
 * 2FA 設定中心：
 * - TOTP 註冊 / 停用 / 救援碼產生（含 QR + 手動 secret + 6 位數驗證）
 * - Passkey 註冊 / 列出 / 刪除（重用 /api/auth/passkey/*）
 *
 * 此頁不檢角色——任何已登入 user 可開 2FA。但 owner / admin 強制由
 * /api/auth/2fa-status enforcement banner 帶入引導（未來放 admin layout）。
 */
export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">兩步驟驗證設定</h1>
        <p className="mt-2 text-sm text-black/60">
          啟用 TOTP（驗證 App）或 Passkey（裝置鎖 / 安全金鑰）強化帳號安全。
          owner / admin 角色必須在註冊後 7 天內啟用其中一種。
        </p>
      </header>
      <TwoFactorSetup />
    </main>
  );
}
