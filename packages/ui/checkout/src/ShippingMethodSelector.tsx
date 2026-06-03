import type { ShippingMethodOption } from './types.js';
import type { JSX } from 'react';


export interface ShippingMethodSelectorProps {
  /** 可選物流方式。 */
  options: ShippingMethodOption[];
  /** 當前選中的 id。 */
  value?: string;
  /** 變更回呼。 */
  onChange?: (id: string) => void;
  /** 貨幣顯示，預設 NT$。 */
  currency?: string;
  /** 額外 className。 */
  className?: string;
}

/**
 * 物流方式選擇器。
 *
 * 顯示運費 + 預估送達時間，符合圓角 14px 規範。
 */
export function ShippingMethodSelector(
  props: ShippingMethodSelectorProps,
): JSX.Element {
  const { options, value, onChange, currency = 'NT$', className } = props;
  return (
    <div
      role="radiogroup"
      aria-label="物流方式"
      className={`grid gap-3 ${className ?? ''}`.trim()}
    >
      {options.map((opt) => {
        const selected = opt.id === value;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={opt.disabled}
            onClick={() => !opt.disabled && onChange?.(opt.id)}
            className={[
              'flex items-center justify-between rounded-[14px] border bg-white p-4 text-left shadow-sm',
              'transition-all duration-200 ease-out',
              selected
                ? 'border-black/40 ring-2 ring-black/10'
                : 'border-black/10 hover:-translate-y-0.5 hover:shadow-md',
              opt.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
            ].join(' ')}
          >
            <span className="flex flex-col">
              <span className="text-sm font-medium text-black/90">{opt.label}</span>
              {opt.eta ? <span className="text-xs text-black/60">{opt.eta}</span> : null}
            </span>
            <span className="text-sm font-semibold text-black/80">
              {opt.fee === 0 ? '免運' : `${currency} ${opt.fee.toLocaleString()}`}
            </span>
          </button>
        );
      })}
    </div>
  );
}
