'use client';

import { useState } from 'react';

/**
 * 結帳表單（Phase 9 多商品擴充 — cart-based）。
 *
 * 收件人 + 同意條款 → POST /api/checkout（cart-id cookie 自動帶）
 * 成功拿到 redirectUrl 後 window.location 跳藍新 hosted page。
 *
 * 簡化：沒有產品資訊（左上 summary 已顯示），表單只關心 recipient + 行銷同意。
 */
export function CheckoutForm({
  totalAmount,
  currency,
}: {
  totalAmount: number;
  currency: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          recipient: {
            name: String(fd.get('name') ?? ''),
            phone: String(fd.get('phone') ?? ''),
            email: String(fd.get('email') ?? ''),
            address: String(fd.get('address') ?? ''),
          },
          marketingOptIn: fd.get('marketingOptIn') === 'on',
        }),
      });
      const data = (await res.json()) as { redirectUrl?: string; error?: string };
      if (!res.ok || !data.redirectUrl) {
        setError(data.error ?? `HTTP ${res.status}：結帳失敗`);
        setBusy(false);
        return;
      }
      window.location.href = data.redirectUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-[var(--radius-2xl)] bg-white p-6 shadow-sm ring-1 ring-black/10"
    >
      <h2 className="text-base font-semibold">收件人資訊</h2>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="opacity-70">姓名 *</span>
          <input
            name="name"
            required
            className="rounded-[var(--radius-md)] border border-black/10 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary-500))]"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="opacity-70">電話 *</span>
          <input
            name="phone"
            required
            inputMode="tel"
            className="rounded-[var(--radius-md)] border border-black/10 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary-500))]"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          <span className="opacity-70">Email *</span>
          <input
            name="email"
            type="email"
            required
            className="rounded-[var(--radius-md)] border border-black/10 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary-500))]"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          <span className="opacity-70">地址（選填）</span>
          <input
            name="address"
            className="rounded-[var(--radius-md)] border border-black/10 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary-500))]"
          />
        </label>
      </div>

      <h2 className="mt-6 text-base font-semibold">付款方式</h2>
      <p className="mt-2 text-xs opacity-60">
        v1：信用卡（藍新 hosted page）。後續會接 ATM / 超商 / LINE Pay 等。
      </p>

      <label className="mt-4 flex items-center gap-2 text-xs">
        <input type="checkbox" name="marketingOptIn" />
        <span>願意收到行銷活動通知</span>
      </label>

      <button
        type="submit"
        disabled={busy}
        className="mt-6 w-full rounded-[var(--radius-md)] bg-[hsl(var(--color-primary-500))] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 ease-out hover:shadow-lg disabled:opacity-50"
      >
        {busy ? '處理中…' : `前往付款 ${currency} ${totalAmount.toLocaleString('zh-TW')}`}
      </button>
      {error && (
        <p className="mt-3 rounded-[var(--radius-md)] bg-rose-50 p-3 text-xs text-rose-800">
          {error}
        </p>
      )}
    </form>
  );
}
