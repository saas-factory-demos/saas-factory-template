'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import {
  loadCartWithChanges,
  updateItem,
  type CartChange,
  type ClientCart,
} from '@/lib/cart/cart-client';

/**
 * Cart 內容（Phase 5 多商品擴充）。
 *
 * 列表 line + 數量加減 + 移除 + subtotal + 前往結帳。
 *
 * 數量改動走 PATCH /api/cart/items；錯誤 inline 顯示。
 */
export function CartPageClient({ locale }: { locale: string }) {
  const [cart, setCart] = useState<ClientCart | null>(null);
  const [changes, setChanges] = useState<CartChange[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadCartWithChanges()
      .then((r) => {
        setCart(r.cart);
        setChanges(r.changes);
      })
      .catch((e) => setError(String(e)));
  }, []);

  async function changeQty(productId: number | string, variantSku: string, qty: number) {
    setBusy(`${productId}-${variantSku}`);
    setError(null);
    try {
      const r = await updateItem({ productId, variantSku, quantity: Math.max(0, qty) });
      if (!r.ok) {
        setError(r.error ?? '更新失敗');
      } else if (r.cart) {
        setCart(r.cart);
        window.dispatchEvent(new CustomEvent('cart-updated'));
      }
    } finally {
      setBusy(null);
    }
  }

  if (!cart) {
    return (
      <div className="rounded-[var(--radius-2xl)] bg-white p-10 text-center shadow-sm ring-1 ring-black/10">
        <p className="text-sm opacity-60">載入中⋯</p>
      </div>
    );
  }
  const items = cart.items ?? [];
  if (items.length === 0) {
    return (
      <div className="rounded-[var(--radius-2xl)] bg-white p-10 text-center shadow-sm ring-1 ring-black/10">
        <p className="text-sm opacity-60">購物車是空的</p>
        <Link
          href={`/${locale}/products`}
          className="mt-4 inline-block rounded-[var(--radius-md)] bg-[hsl(var(--color-primary-500))] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 ease-out hover:shadow-md"
        >
          去逛逛
        </Link>
      </div>
    );
  }

  function getLineChanges(productId: number | string, variantSku: string) {
    return changes.find(
      (c) => String(c.productId) === String(productId) && c.variantSku === variantSku,
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
      <ul className="space-y-3">
        {items.map((it) => {
          const key = `${String(it.product)}-${it.variantSku}`;
          const isBusy = busy === key;
          const lineTotal = it.unitPriceSnapshot * it.quantity;
          const optionLabel = it.optionValuesSnapshot
            ? Object.entries(it.optionValuesSnapshot)
                .map(([k, v]) => `${k}：${v}`)
                .join('、')
            : null;
          const lineChanges = getLineChanges(it.product, it.variantSku);
          return (
            <li
              key={key}
              className="rounded-[var(--radius-lg)] bg-white p-4 shadow-sm ring-1 ring-black/10"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-base font-semibold">{it.titleSnapshot ?? '商品'}</p>
                  {optionLabel && (
                    <p className="mt-1 text-xs opacity-60">{optionLabel}</p>
                  )}
                  <p className="mt-1 font-mono text-[11px] opacity-40">SKU: {it.variantSku}</p>
                </div>
                <div className="text-right text-sm font-semibold">
                  {cart.currency} {lineTotal.toLocaleString('zh-TW')}
                </div>
              </div>
              {lineChanges && (
                <div className="mt-2 space-y-1">
                  {lineChanges.changes.map((c, ci) => (
                    <p
                      key={ci}
                      className="rounded-[var(--radius-sm)] bg-amber-50 px-2 py-1 text-[11px] text-amber-900"
                    >
                      {c.kind === 'price-changed' &&
                        `價格已更新：${c.oldPrice} → ${c.newPrice}（結帳將以最新價格計算）`}
                      {c.kind === 'out-of-stock' &&
                        `庫存不足（剩 ${c.available} 件，您加購 ${c.requested}）`}
                      {c.kind === 'variant-removed' && '此商品 / 規格已下架，請移除或更換'}
                    </p>
                  ))}
                </div>
              )}
              <div className="mt-3 flex items-center justify-between">
                <div className="inline-flex items-center gap-1 rounded-[var(--radius-md)] bg-stone-50 p-1">
                  <button
                    type="button"
                    onClick={() => void changeQty(it.product, it.variantSku, it.quantity - 1)}
                    disabled={isBusy}
                    className="h-7 w-7 rounded-[var(--radius-sm)] bg-white text-sm shadow-sm transition-all hover:shadow disabled:opacity-50"
                  >
                    −
                  </button>
                  <span className="min-w-[2rem] text-center text-sm font-medium">
                    {it.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => void changeQty(it.product, it.variantSku, it.quantity + 1)}
                    disabled={isBusy}
                    className="h-7 w-7 rounded-[var(--radius-sm)] bg-white text-sm shadow-sm transition-all hover:shadow disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => void changeQty(it.product, it.variantSku, 0)}
                  disabled={isBusy}
                  className="text-xs text-rose-600 transition-all hover:text-rose-800 disabled:opacity-50"
                >
                  移除
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <aside>
        <div className="sticky top-6 rounded-[var(--radius-xl)] bg-white p-6 shadow-sm ring-1 ring-black/10">
          <h2 className="text-base font-semibold">訂單摘要</h2>
          <dl className="mt-4 grid grid-cols-[1fr_auto] gap-y-2 text-sm">
            <dt className="opacity-60">小計</dt>
            <dd className="text-right">
              {cart.currency} {(cart.subtotal ?? 0).toLocaleString('zh-TW')}
            </dd>
            <dt className="opacity-60">折扣</dt>
            <dd className="text-right">
              − {cart.currency} {((cart.subtotal ?? 0) - (cart.estimatedTotal ?? 0)).toLocaleString('zh-TW')}
            </dd>
            <dt className="border-t border-black/10 pt-2 font-semibold">預估總計</dt>
            <dd className="border-t border-black/10 pt-2 text-right font-semibold">
              {cart.currency} {(cart.estimatedTotal ?? 0).toLocaleString('zh-TW')}
            </dd>
          </dl>
          <p className="mt-2 text-[11px] opacity-50">運費與稅金結帳時計算</p>
          <Link
            href={`/${locale}/checkout?fromCart=1`}
            className="mt-5 block w-full rounded-[var(--radius-md)] bg-[hsl(var(--color-primary-500))] px-4 py-3 text-center text-sm font-semibold text-white shadow-sm transition-all duration-200 ease-out hover:shadow-lg"
          >
            前往結帳
          </Link>
          {error && (
            <p className="mt-3 rounded-[var(--radius-md)] bg-rose-50 p-3 text-xs text-rose-800">
              {error}
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}
