'use client';

import { useMemo, useState } from 'react';

import { AddToCartButton } from '@/components/cart/AddToCartButton';

interface OptionValue {
  value: string;
  label?: string;
}

interface OptionDef {
  name: string;
  values?: OptionValue[];
}

interface Variant {
  sku: string;
  optionValues?: Record<string, string>;
  unitPrice: number;
  stock?: number;
  reservedStock?: number;
  image?: { url?: string; alt?: string } | null;
}

/**
 * Variant 規格選擇器（Phase 7 多商品擴充）。
 *
 * 依 optionDefs 渲染一組 select（顏色 / 尺寸 / 容量）；當前選擇組合對應
 * 某一筆 variants[] 時：
 * - 顯示該 variant unitPrice / 庫存
 * - AddToCartButton 帶該 variant SKU
 *
 * 不存在的組合（例：紅色 XXL 沒進貨）→ 按鈕 disabled、顯示「此組合無庫存」
 *
 * 單變體商品（optionDefs 空 + variants 只 1 個）→ 不顯示 selector，直接給按鈕
 */
export function VariantSelector({
  productId,
  optionDefs,
  variants,
  productCurrency = 'TWD',
  fallbackPrice,
}: {
  productId: number | string;
  optionDefs: OptionDef[];
  variants: Variant[];
  productCurrency?: string;
  fallbackPrice?: number;
}) {
  const isSingle = optionDefs.length === 0 || variants.length <= 1;
  const firstVariant = variants[0];

  const [selection, setSelection] = useState<Record<string, string>>(() => {
    if (isSingle && firstVariant?.optionValues) return firstVariant.optionValues;
    return {};
  });

  const currentVariant = useMemo(() => {
    if (isSingle) return firstVariant;
    return variants.find((v) => {
      if (!v.optionValues) return false;
      return Object.entries(selection).every(([k, val]) => v.optionValues?.[k] === val);
    });
  }, [variants, selection, isSingle, firstVariant]);

  const allOptionsSelected = optionDefs.every((od) => selection[od.name]);
  const available = currentVariant
    ? Math.max(0, (currentVariant.stock ?? 0) - (currentVariant.reservedStock ?? 0))
    : 0;
  const price = currentVariant?.unitPrice ?? fallbackPrice ?? 0;

  return (
    <div className="flex flex-col gap-5">
      {!isSingle &&
        optionDefs.map((od) => (
          <div key={od.name}>
            <p className="mb-2 text-xs font-semibold uppercase opacity-60">{od.name}</p>
            <div className="flex flex-wrap gap-2">
              {od.values?.map((ov) => {
                const isSelected = selection[od.name] === ov.value;
                // 檢查此值是否有任何 variant 有貨（搭配當前其他選擇）
                const otherSelections = { ...selection };
                delete otherSelections[od.name];
                const hasMatchingStock = variants.some((v) => {
                  if (v.optionValues?.[od.name] !== ov.value) return false;
                  const matchesOthers = Object.entries(otherSelections).every(
                    ([k, val]) => v.optionValues?.[k] === val,
                  );
                  if (!matchesOthers) return false;
                  const avail = (v.stock ?? 0) - (v.reservedStock ?? 0);
                  return avail > 0;
                });
                return (
                  <button
                    key={ov.value}
                    type="button"
                    onClick={() =>
                      setSelection((s) => ({ ...s, [od.name]: ov.value }))
                    }
                    disabled={!hasMatchingStock && !isSelected}
                    className={`rounded-[var(--radius-md)] border px-3 py-1.5 text-sm transition-all duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-40 ${
                      isSelected
                        ? 'border-black bg-black text-white'
                        : 'border-black/15 bg-white hover:border-black/30 hover:shadow-sm'
                    }`}
                  >
                    {ov.label ?? ov.value}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

      <div className="rounded-[var(--radius-lg)] border border-black/10 bg-stone-50 p-4">
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold">
            {productCurrency} {price.toLocaleString('zh-TW')}
          </span>
          <span className="text-xs opacity-60">
            {!allOptionsSelected
              ? '請選擇規格'
              : !currentVariant
                ? '此組合無庫存'
                : available > 0
                  ? `剩 ${available} 件`
                  : '已售完'}
          </span>
        </div>
        <div className="mt-4">
          <AddToCartButton
            productId={productId}
            variantSku={currentVariant?.sku ?? ''}
            quantity={1}
            disabled={!currentVariant || available <= 0}
          />
        </div>
      </div>
    </div>
  );
}
