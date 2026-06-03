import type { PaymentMethodOption } from './types.js';
import type { JSX } from 'react';


export interface PaymentMethodSelectorProps {
  /** 可選付款方式。 */
  options: PaymentMethodOption[];
  /** 當前選中的 id。 */
  value?: string;
  /** 選擇變更回呼。 */
  onChange?: (id: string) => void;
  /** 額外 className。 */
  className?: string;
}

/**
 * 付款方式選擇器。
 *
 * 依 config 自動顯示可用方法 + 各方法圖示，符合 CLAUDE.md §四 圓角 14px。
 */
export function PaymentMethodSelector(props: PaymentMethodSelectorProps): JSX.Element {
  const { options, value, onChange, className } = props;
  return (
    <div
      role="radiogroup"
      aria-label="付款方式"
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
              'flex items-center gap-3 rounded-[14px] border bg-white p-4 text-left shadow-sm',
              'transition-all duration-200 ease-out',
              selected
                ? 'border-black/40 ring-2 ring-black/10'
                : 'border-black/10 hover:-translate-y-0.5 hover:shadow-md',
              opt.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
            ].join(' ')}
          >
            {opt.icon ? (
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/5 text-xl">
                {opt.icon}
              </span>
            ) : null}
            <span className="flex flex-col">
              <span className="text-sm font-medium text-black/90">{opt.label}</span>
              {opt.description ? (
                <span className="text-xs text-black/60">{opt.description}</span>
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}
