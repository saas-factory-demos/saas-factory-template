'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { loadCart, type ClientCart } from '@/lib/cart/cart-client';

/**
 * 全域 cart icon + badge（layout 用）。
 *
 * 載入時 fetch /api/cart（順帶設 cookie）；之後監聽 `window 'cart-updated'`
 * event（AddToCartButton 觸發）重撈。
 *
 * 計數方式：items.length（line 數）vs items reduce qty（總件數）二選一；
 * 真實電商通常顯示總件數比較直覺。
 */
export function CartIcon({ locale }: { locale: string }) {
  const [cart, setCart] = useState<ClientCart | null>(null);

  async function refresh() {
    try {
      const c = await loadCart();
      setCart(c);
    } catch {
      // ignore: 沒登入 / 後端 down 都讓 icon 維持 0
    }
  }

  useEffect(() => {
    void refresh();
    const handler = () => void refresh();
    window.addEventListener('cart-updated', handler);
    return () => window.removeEventListener('cart-updated', handler);
  }, []);

  const totalQty =
    cart?.items?.reduce((sum, it) => sum + (it.quantity ?? 0), 0) ?? 0;

  return (
    <Link
      href={`/${locale}/cart`}
      aria-label="購物車"
      className="relative inline-flex items-center justify-center rounded-[var(--radius-full)] p-2 transition-all duration-200 ease-out hover:bg-stone-100"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        className="h-5 w-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
        />
      </svg>
      {totalQty > 0 && (
        <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-[var(--radius-full)] bg-[hsl(var(--color-primary-500))] px-1 text-[10px] font-semibold text-white">
          {totalQty > 99 ? '99+' : totalQty}
        </span>
      )}
    </Link>
  );
}
