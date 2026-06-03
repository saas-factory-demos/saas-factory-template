'use client';

import { useState } from 'react';

import { addItem } from '@/lib/cart/cart-client';

/**
 * 加入購物車按鈕（Phase 5 多商品擴充）。
 *
 * 用在商品詳情頁。接收 variantSku（變體選擇器決定後傳進來）+ quantity。
 *
 * 狀態：idle → loading → success（綠勾 1.2s）/ error（紅字 3s）→ idle
 * 缺貨時顯示 available qty 給用戶調整。
 */
export function AddToCartButton({
  productId,
  variantSku,
  quantity = 1,
  disabled,
  label = '加入購物車',
}: {
  productId: number | string;
  variantSku: string;
  quantity?: number;
  disabled?: boolean;
  label?: string;
}) {
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  async function onClick() {
    setState('loading');
    setMessage(null);
    try {
      const r = await addItem({ productId, variantSku, quantity });
      if (!r.ok) {
        setState('error');
        const avail = r.available !== undefined ? `（剩 ${r.available} 件）` : '';
        setMessage((r.error ?? '加入失敗') + avail);
        setTimeout(() => setState('idle'), 3000);
        return;
      }
      setState('success');
      // 觸發全域 cart-updated event，layout 內 CartIcon badge 重撈
      window.dispatchEvent(new CustomEvent('cart-updated'));
      setTimeout(() => setState('idle'), 1200);
    } catch (err) {
      setState('error');
      setMessage(err instanceof Error ? err.message : String(err));
      setTimeout(() => setState('idle'), 3000);
    }
  }

  const styles = {
    idle: 'bg-[hsl(var(--color-primary-500))] text-white hover:shadow-md',
    loading: 'bg-stone-300 text-stone-600 cursor-wait',
    success: 'bg-emerald-500 text-white',
    error: 'bg-rose-500 text-white',
  } as const;

  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled || state === 'loading' || state === 'success'}
        className={`rounded-[var(--radius-md)] px-6 py-3 text-sm font-semibold shadow-sm transition-all duration-200 ease-out disabled:opacity-50 ${styles[state]}`}
      >
        {state === 'idle' && label}
        {state === 'loading' && '加入中⋯'}
        {state === 'success' && '✓ 已加入'}
        {state === 'error' && '✕ 失敗'}
      </button>
      {message && state === 'error' && (
        <p className="text-xs text-rose-700">{message}</p>
      )}
    </div>
  );
}
