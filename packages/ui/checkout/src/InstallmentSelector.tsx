import type { InstallmentOption } from './types.js';
import type { JSX } from 'react';


export interface InstallmentSelectorProps {
  /** 可選分期方案。 */
  options: InstallmentOption[];
  /** 當前選中的期數，0 或 1 視為一次付清。 */
  value?: number;
  /** 變更回呼。 */
  onChange?: (periods: number) => void;
  /** 額外 className。 */
  className?: string;
}

/**
 * 分期期數選擇器。
 *
 * 0 代表一次付清，其餘按 periods 顯示。
 */
export function InstallmentSelector(props: InstallmentSelectorProps): JSX.Element {
  const { options, value, onChange, className } = props;
  return (
    <div className={`flex flex-wrap gap-2 ${className ?? ''}`.trim()} role="radiogroup">
      <button
        type="button"
        role="radio"
        aria-checked={!value || value <= 1}
        onClick={() => onChange?.(1)}
        className={[
          'rounded-lg border px-4 py-2 text-sm shadow-sm',
          'transition-all duration-200 ease-out',
          !value || value <= 1
            ? 'border-black/40 bg-black text-white'
            : 'border-black/10 bg-white text-black/80 hover:shadow-md',
        ].join(' ')}
      >
        一次付清
      </button>
      {options.map((opt) => {
        const selected = opt.periods === value;
        return (
          <button
            key={opt.periods}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange?.(opt.periods)}
            className={[
              'rounded-lg border px-4 py-2 text-sm shadow-sm',
              'transition-all duration-200 ease-out',
              selected
                ? 'border-black/40 bg-black text-white'
                : 'border-black/10 bg-white text-black/80 hover:shadow-md',
            ].join(' ')}
          >
            <span className="font-medium">{opt.periods} 期</span>
            <span className="ml-1 text-xs opacity-70">
              每期 {opt.currency} {opt.perPeriodAmount.toLocaleString()}
            </span>
          </button>
        );
      })}
    </div>
  );
}
