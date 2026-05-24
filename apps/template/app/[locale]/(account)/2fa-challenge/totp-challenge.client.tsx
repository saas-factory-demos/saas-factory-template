'use client';

import { useState } from 'react';

/**
 * 2FA 挑戰表單（兩種模式）：
 *
 * 1. TOTP：使用者輸入 6 位數 → POST /api/auth/totp/login-verify
 * 2. 救援碼：裝置遺失走 fallback → POST /api/auth/totp/recovery-verify
 *
 * 兩個 endpoint 成功時都會 Set-Cookie sf-totp-session，client 拿到 ok=true 後
 * window.location 回 nextPath。
 *
 * 故意用 window.location（非 Next router.push）：要讓瀏覽器帶上剛收到的 Set-Cookie 重新發 request，
 * 才會讓 middleware 看到新 cookie 而放行。
 */
export function TotpChallenge({ nextPath }: { nextPath: string }) {
  const [mode, setMode] = useState<'totp' | 'recovery'>('totp');

  return (
    <div className="space-y-4 rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
      <div className="flex gap-2 rounded-xl bg-black/5 p-1 text-sm">
        <button
          type="button"
          onClick={() => setMode('totp')}
          className={`flex-1 rounded-lg px-3 py-2 transition-all duration-200 ease-out ${
            mode === 'totp' ? 'bg-white shadow-sm' : 'text-black/60 hover:text-black'
          }`}
        >
          驗證 App
        </button>
        <button
          type="button"
          onClick={() => setMode('recovery')}
          className={`flex-1 rounded-lg px-3 py-2 transition-all duration-200 ease-out ${
            mode === 'recovery' ? 'bg-white shadow-sm' : 'text-black/60 hover:text-black'
          }`}
        >
          救援碼
        </button>
      </div>
      {mode === 'totp' ? (
        <TotpForm nextPath={nextPath} />
      ) : (
        <RecoveryForm nextPath={nextPath} />
      )}
    </div>
  );
}

function TotpForm({ nextPath }: { nextPath: string }) {
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!/^\d{6}$/.test(token.trim())) {
      setError('請輸入 6 位數驗證碼');
      return;
    }
    setPending(true);
    try {
      const res = await fetch('/api/auth/totp/login-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim() }),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setError(json.error ?? '驗證失敗');
        setPending(false);
        return;
      }
      window.location.href = sanitizeNextPath(nextPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : '網路錯誤');
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium">6 位數驗證碼</span>
        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          maxLength={6}
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 text-center text-2xl tracking-[0.5em] tabular-nums focus:border-black/40 focus:outline-none"
          placeholder="000000"
        />
      </label>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-black px-4 py-3 text-sm font-medium text-white transition-all duration-200 ease-out hover:shadow-lg disabled:opacity-50"
      >
        {pending ? '驗證中…' : '驗證'}
      </button>
    </form>
  );
}

function RecoveryForm({ nextPath }: { nextPath: string }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!code.trim()) {
      setError('請輸入救援碼');
      return;
    }
    setPending(true);
    try {
      const res = await fetch('/api/auth/totp/recovery-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      });
      const json = (await res.json()) as {
        ok: boolean;
        error?: string;
        remaining?: number;
      };
      if (!res.ok || !json.ok) {
        setError(json.error ?? '救援碼錯誤');
        setPending(false);
        return;
      }
      // 提示剩餘救援碼數量後跳轉，使用者可在後台重產
      if (typeof json.remaining === 'number' && json.remaining <= 3) {
        alert(`救援碼僅剩 ${json.remaining} 組，建議登入後重產。`);
      }
      window.location.href = sanitizeNextPath(nextPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : '網路錯誤');
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium">救援碼</span>
        <input
          type="text"
          autoComplete="off"
          autoFocus
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 font-mono text-lg tracking-wider focus:border-black/40 focus:outline-none"
          placeholder="ABCD-1234"
        />
      </label>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-black px-4 py-3 text-sm font-medium text-white transition-all duration-200 ease-out hover:shadow-lg disabled:opacity-50"
      >
        {pending ? '驗證中…' : '使用救援碼登入'}
      </button>
      <p className="text-xs text-black/50">
        每組救援碼僅能使用一次。用完後請到「2FA 設定」重產。
      </p>
    </form>
  );
}

/**
 * 限制 nextPath 必須是站內路徑，防 open-redirect。
 */
function sanitizeNextPath(next: string): string {
  if (!next.startsWith('/') || next.startsWith('//')) return '/admin';
  return next;
}
