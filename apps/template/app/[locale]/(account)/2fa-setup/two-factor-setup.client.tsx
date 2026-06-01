'use client';

import {
  startAuthentication,
  startRegistration,
} from '@simplewebauthn/browser';
import { useCallback, useEffect, useState } from 'react';

/**
 * 2FA setup 主元件（client）。
 *
 * 分頁：
 * - TOTP：未啟用 → 顯示「開始設定」按鈕；點擊後叫 /setup-init 拿 QR + 顯示 6 碼輸入框。
 *         已啟用 → 顯示「停用」表單（要輸入現行碼）。
 * - Passkey：列出已註冊憑證 + 「新增」按鈕（叫 /register-options → navigator.credentials.create
 *         → /register-verify）。
 *
 * 此元件完全 client-side fetch；不走 server actions，避免複雜表單狀態傳遞。
 */

type Status = {
  totpEnabled: boolean;
  passkeyCount: number;
  enforcement?: { mode: 'ok' | 'nudge' | 'block'; reason?: string };
};

type TotpInit = {
  secret: string;
  otpauthUrl: string;
  qrDataUrl: string;
  recoveryCodes: string[];
};

type Tab = 'totp' | 'passkey';

export function TwoFactorSetup() {
  const [tab, setTab] = useState<Tab>('totp');
  const [status, setStatus] = useState<Status | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  const reloadStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/2fa-status', {
        credentials: 'include',
      });
      const data = (await res.json()) as
        | { ok: true; totpEnabled: boolean; passkeyCount: number; enforcement: Status['enforcement'] }
        | { ok: false; error: string };
      if (!data.ok) {
        setStatusError(data.error);
        return;
      }
      setStatus({
        totpEnabled: data.totpEnabled,
        passkeyCount: data.passkeyCount,
        enforcement: data.enforcement,
      });
      setStatusError(null);
    } catch (err) {
      setStatusError(err instanceof Error ? err.message : '無法載入 2FA 狀態');
    }
  }, []);

  useEffect(() => {
    void reloadStatus();
  }, [reloadStatus]);

  return (
    <div className="space-y-6">
      {status?.enforcement && status.enforcement.mode !== 'ok' ? (
        <EnforcementBanner enforcement={status.enforcement} />
      ) : null}

      {statusError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          載入狀態失敗：{statusError}
        </div>
      ) : null}

      <nav className="flex gap-2 rounded-xl border border-black/10 bg-white p-1">
        <TabButton active={tab === 'totp'} onClick={() => setTab('totp')}>
          驗證 App（TOTP）
          {status?.totpEnabled ? <Badge>已啟用</Badge> : null}
        </TabButton>
        <TabButton active={tab === 'passkey'} onClick={() => setTab('passkey')}>
          Passkey / 安全金鑰
          {status?.passkeyCount ? <Badge>{status.passkeyCount} 把</Badge> : null}
        </TabButton>
      </nav>

      {tab === 'totp' ? (
        <TotpSection
          enabled={status?.totpEnabled ?? false}
          onChange={() => void reloadStatus()}
        />
      ) : (
        <PasskeySection onChange={() => void reloadStatus()} />
      )}
    </div>
  );
}

function EnforcementBanner({
  enforcement,
}: {
  enforcement: NonNullable<Status['enforcement']>;
}) {
  const bg =
    enforcement.mode === 'block'
      ? 'border-red-200 bg-red-50 text-red-700'
      : 'border-amber-200 bg-amber-50 text-amber-700';
  return (
    <div className={`rounded-xl border p-4 text-sm ${bg}`}>
      {enforcement.mode === 'block'
        ? '帳號已被擋下：請立即啟用 2FA 才能繼續使用後台。'
        : '提醒：你的角色需於 7 天緩衝期內啟用 2FA。'}
      {enforcement.reason ? <span className="ml-1 opacity-70">（{enforcement.reason}）</span> : null}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ease-out ${
        active ? 'bg-black text-white shadow-sm' : 'text-black/70 hover:bg-black/5'
      }`}
    >
      {children}
    </button>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="ml-2 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* TOTP                                                                */
/* ------------------------------------------------------------------ */

function TotpSection({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: () => void;
}) {
  return enabled ? <TotpDisableForm onDone={onChange} /> : <TotpEnableFlow onDone={onChange} />;
}

function TotpEnableFlow({ onDone }: { onDone: () => void }) {
  const [init, setInit] = useState<TotpInit | null>(null);
  const [token, setToken] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);

  async function start(): Promise<void> {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/totp/setup-init', {
        method: 'POST',
        credentials: 'include',
      });
      const data = (await res.json()) as
        | { ok: true; secret: string; otpauthUrl: string; qrDataUrl: string; recoveryCodes: string[] }
        | { ok: false; error: string };
      if (!data.ok) {
        setError(data.error);
        return;
      }
      setInit({
        secret: data.secret,
        otpauthUrl: data.otpauthUrl,
        qrDataUrl: data.qrDataUrl,
        recoveryCodes: data.recoveryCodes,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '啟動設定失敗');
    } finally {
      setBusy(false);
    }
  }

  async function verify(): Promise<void> {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/totp/setup-verify', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!data.ok) {
        setError(data.error ?? '驗證失敗');
        return;
      }
      setVerified(true);
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : '驗證失敗');
    } finally {
      setBusy(false);
    }
  }

  if (verified && init) {
    return (
      <Card>
        <h2 className="text-lg font-semibold">2FA 已啟用</h2>
        <p className="mt-2 text-sm text-black/70">
          請務必將以下救援碼列印或抄寫保存。每組僅可使用一次，遺失裝置時用來重新登入。
        </p>
        <RecoveryCodeList codes={init.recoveryCodes} />
      </Card>
    );
  }

  if (!init) {
    return (
      <Card>
        <h2 className="text-lg font-semibold">啟用 TOTP 驗證 App</h2>
        <p className="mt-2 text-sm text-black/70">
          推薦使用 1Password / Authy / Google Authenticator / iCloud Keychain。
          點擊下方按鈕開始流程；secret 與救援碼在你輸入第一個 6 位數驗證碼後才會寫進帳號。
        </p>
        <button
          type="button"
          onClick={() => void start()}
          disabled={busy}
          className="mt-4 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-all duration-200 ease-out hover:shadow-md disabled:opacity-50"
        >
          {busy ? '產生中…' : '開始設定'}
        </button>
        {error ? <ErrorMsg text={error} /> : null}
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-lg font-semibold">掃描 QR Code</h2>
      <p className="mt-2 text-sm text-black/70">
        用你的 Authenticator App 掃描下方 QR，或手動輸入 secret。完成後回到此處輸入產生的 6 位數驗證碼。
      </p>
      <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-start">
        <img
          src={init.qrDataUrl}
          alt="TOTP QR Code"
          className="h-64 w-64 rounded-xl border border-black/10 bg-white p-2"
        />
        <div className="flex-1 space-y-3">
          <div>
            <label className="text-xs uppercase tracking-wide text-black/50">Secret（手動輸入）</label>
            <code className="mt-1 block break-all rounded-lg border border-black/10 bg-black/5 p-3 font-mono text-sm">
              {init.secret}
            </code>
          </div>
          <RecoveryCodeList codes={init.recoveryCodes} note="先抄起來，下一步驗證成功後此頁將不再顯示。" />
        </div>
      </div>
      <div className="mt-6 flex items-end gap-3">
        <div className="flex-1">
          <label className="text-xs uppercase tracking-wide text-black/50">6 位數驗證碼</label>
          <input
            type="text"
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            value={token}
            onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
            placeholder="000000"
            className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 font-mono text-lg tracking-widest focus:border-black/40 focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={() => void verify()}
          disabled={busy || token.length !== 6}
          className="rounded-lg bg-black px-5 py-2 text-sm font-medium text-white transition-all duration-200 ease-out hover:shadow-md disabled:opacity-50"
        >
          {busy ? '驗證中…' : '驗證並啟用'}
        </button>
      </div>
      {error ? <ErrorMsg text={error} /> : null}
    </Card>
  );
}

function TotpDisableForm({ onDone }: { onDone: () => void }) {
  const [token, setToken] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newCodes, setNewCodes] = useState<string[] | null>(null);

  async function disable(): Promise<void> {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/totp/disable', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!data.ok) {
        setError(data.error ?? '停用失敗');
        return;
      }
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : '停用失敗');
    } finally {
      setBusy(false);
    }
  }

  async function regenerate(): Promise<void> {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/totp/recovery-regenerate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token }),
      });
      const data = (await res.json()) as
        | { ok: true; recoveryCodes: string[] }
        | { ok: false; error: string };
      if (!data.ok) {
        setError(data.error);
        return;
      }
      setNewCodes(data.recoveryCodes);
    } catch (err) {
      setError(err instanceof Error ? err.message : '產生失敗');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <h2 className="text-lg font-semibold">TOTP 已啟用</h2>
      <p className="mt-2 text-sm text-black/70">
        輸入現在的 6 位數驗證碼後可【停用 2FA】或【重產救援碼】。重產會作廢所有舊救援碼。
      </p>
      <div className="mt-4 flex items-end gap-3">
        <div className="flex-1">
          <label className="text-xs uppercase tracking-wide text-black/50">驗證碼</label>
          <input
            type="text"
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            value={token}
            onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
            placeholder="000000"
            className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 font-mono text-lg tracking-widest focus:border-black/40 focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={() => void regenerate()}
          disabled={busy || token.length !== 6}
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 transition-all duration-200 ease-out hover:shadow-md disabled:opacity-50"
        >
          重產救援碼
        </button>
        <button
          type="button"
          onClick={() => void disable()}
          disabled={busy || token.length !== 6}
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-all duration-200 ease-out hover:shadow-md disabled:opacity-50"
        >
          {busy ? '處理中…' : '停用 2FA'}
        </button>
      </div>
      {error ? <ErrorMsg text={error} /> : null}
      {newCodes ? (
        <div className="mt-6">
          <RecoveryCodeList
            codes={newCodes}
            note="新救援碼僅此一次顯示。舊救援碼已全部作廢，請立即抄寫保存。"
          />
        </div>
      ) : null}
    </Card>
  );
}

function RecoveryCodeList({ codes, note }: { codes: string[]; note?: string }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wide text-black/50">救援碼（共 {codes.length} 組）</label>
      {note ? <p className="mt-1 text-xs text-amber-700">{note}</p> : null}
      <ul className="mt-2 grid grid-cols-2 gap-2 rounded-lg border border-black/10 bg-black/5 p-3 font-mono text-sm">
        {codes.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Passkey                                                             */
/* ------------------------------------------------------------------ */

type PasskeyItem = {
  id: string;
  credentialId: string;
  nickname: string | null;
  createdAt: string | null;
  lastUsedAt: string | null;
};

function PasskeySection({ onChange }: { onChange: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [probeOk, setProbeOk] = useState(false);
  const [nickname, setNickname] = useState('');
  const [items, setItems] = useState<PasskeyItem[] | null>(null);

  const reload = useCallback(async (): Promise<void> => {
    try {
      const res = await fetch('/api/auth/passkey/list', { credentials: 'include' });
      const data = (await res.json()) as
        | { ok: true; credentials: PasskeyItem[] }
        | { ok: false; error: string };
      if (!data.ok) {
        setError(data.error);
        return;
      }
      setItems(data.credentials);
    } catch (err) {
      setError(err instanceof Error ? err.message : '讀取清單失敗');
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function register(): Promise<void> {
    setBusy(true);
    setError(null);
    setProbeOk(false);
    try {
      const opt = await fetch('/api/auth/passkey/register-options', {
        method: 'POST',
        credentials: 'include',
      });
      const optData = (await opt.json()) as
        | { ok: true; options: Parameters<typeof startRegistration>[0]['optionsJSON'] }
        | { ok: false; error: string };
      if (!optData.ok) {
        setError(optData.error);
        return;
      }
      const attResp = await startRegistration({ optionsJSON: optData.options });
      const ver = await fetch('/api/auth/passkey/register-verify', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ response: attResp, nickname }),
      });
      const verData = (await ver.json()) as
        | { ok: true; credentialId: string }
        | { ok: false; error: string };
      if (!verData.ok) {
        setError(verData.error);
        return;
      }
      setNickname('');
      await reload();
      onChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Passkey 註冊失敗');
    } finally {
      setBusy(false);
    }
  }

  async function probe(): Promise<void> {
    // 驗證流程實際在登入頁；此處只給管理員快速 sanity check。
    setBusy(true);
    setError(null);
    setProbeOk(false);
    try {
      const opt = await fetch('/api/auth/passkey/auth-options', {
        method: 'POST',
        credentials: 'include',
      });
      const optData = (await opt.json()) as
        | { ok: true; options: Parameters<typeof startAuthentication>[0]['optionsJSON'] }
        | { ok: false; error: string };
      if (!optData.ok) {
        setError(optData.error);
        return;
      }
      const assResp = await startAuthentication({ optionsJSON: optData.options });
      const ver = await fetch('/api/auth/passkey/auth-verify', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ response: assResp }),
      });
      const verData = (await ver.json()) as { ok: boolean; error?: string };
      if (!verData.ok) {
        setError(verData.error ?? '驗證失敗');
        return;
      }
      setProbeOk(true);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Passkey 驗證失敗');
    } finally {
      setBusy(false);
    }
  }

  async function rename(id: string, next: string): Promise<void> {
    setError(null);
    try {
      const res = await fetch(`/api/auth/passkey/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ nickname: next }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!data.ok) {
        setError(data.error ?? '改名失敗');
        return;
      }
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : '改名失敗');
    }
  }

  async function remove(id: string): Promise<void> {
    if (!confirm('確定刪除這把 Passkey？刪除後該裝置無法再用此憑證登入。')) return;
    setError(null);
    try {
      const res = await fetch(`/api/auth/passkey/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!data.ok) {
        setError(data.error ?? '刪除失敗');
        return;
      }
      await reload();
      onChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : '刪除失敗');
    }
  }

  return (
    <Card>
      <h2 className="text-lg font-semibold">Passkey / 安全金鑰</h2>
      <p className="mt-2 text-sm text-black/70">
        註冊 iCloud Keychain / 1Password / YubiKey 等 WebAuthn 憑證。一個帳號可註冊多把以避免單裝置遺失。
      </p>

      <div className="mt-4 space-y-3">
        <div>
          <label className="text-xs uppercase tracking-wide text-black/50">暱稱（選填）</label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="例：iCloud Keychain / YubiKey 5C"
            className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:border-black/40 focus:outline-none"
          />
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => void register()}
            disabled={busy}
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-all duration-200 ease-out hover:shadow-md disabled:opacity-50"
          >
            {busy ? '處理中…' : '註冊新 Passkey'}
          </button>
          <button
            type="button"
            onClick={() => void probe()}
            disabled={busy || !items || items.length === 0}
            className="rounded-lg border border-black/10 bg-white px-4 py-2 text-sm font-medium text-black/70 transition-all duration-200 ease-out hover:shadow-md disabled:opacity-50"
          >
            測試驗證
          </button>
        </div>
        {probeOk ? <p className="text-sm text-emerald-700">Passkey 驗證成功。</p> : null}
        {error ? <ErrorMsg text={error} /> : null}
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-semibold text-black/70">已註冊 Passkey</h3>
        {items === null ? (
          <p className="mt-2 text-sm text-black/50">載入中…</p>
        ) : items.length === 0 ? (
          <p className="mt-2 text-sm text-black/50">尚未註冊任何 Passkey。</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {items.map((it) => (
              <PasskeyRow
                key={it.id}
                item={it}
                onRename={(next) => void rename(it.id, next)}
                onDelete={() => void remove(it.id)}
              />
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}

function PasskeyRow({
  item,
  onRename,
  onDelete,
}: {
  item: PasskeyItem;
  onRename: (nickname: string) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item.nickname ?? '');

  return (
    <li className="rounded-xl border border-black/10 bg-black/5 p-3 text-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          {editing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                maxLength={80}
                className="flex-1 rounded-lg border border-black/10 bg-white px-2 py-1 text-sm focus:border-black/40 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  const trimmed = draft.trim();
                  if (trimmed.length === 0) return;
                  onRename(trimmed);
                  setEditing(false);
                }}
                className="rounded-lg bg-black px-3 py-1 text-xs font-medium text-white transition-all duration-200 ease-out hover:shadow-md"
              >
                儲存
              </button>
              <button
                type="button"
                onClick={() => {
                  setDraft(item.nickname ?? '');
                  setEditing(false);
                }}
                className="rounded-lg border border-black/10 bg-white px-3 py-1 text-xs font-medium text-black/60 transition-all duration-200 ease-out hover:shadow-md"
              >
                取消
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="truncate font-medium">{item.nickname ?? '未命名 Passkey'}</span>
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="text-xs text-black/50 underline hover:text-black/80"
              >
                改名
              </button>
            </div>
          )}
          <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-black/50">
            <span className="font-mono">{item.credentialId.slice(0, 16)}…</span>
            {item.createdAt ? <span>建立 {formatDate(item.createdAt)}</span> : null}
            <span>最後使用 {item.lastUsedAt ? formatDate(item.lastUsedAt) : '尚未'}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onDelete}
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700 transition-all duration-200 ease-out hover:shadow-md"
        >
          刪除
        </button>
      </div>
    </li>
  );
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString('zh-TW', { hour12: false });
  } catch {
    return iso;
  }
}

/* ------------------------------------------------------------------ */
/* shared                                                              */
/* ------------------------------------------------------------------ */

function Card({ children }: { children: React.ReactNode }) {
  return <section className="rounded-xl border border-black/10 bg-white p-6 shadow-sm">{children}</section>;
}

function ErrorMsg({ text }: { text: string }) {
  return <p className="mt-3 text-sm text-red-700">{text}</p>;
}
