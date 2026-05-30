import { useState } from 'react';

import type { InvoiceFormValue } from './types.js';
import type { JSX } from 'react';


const CARRIER_LABEL: Record<InvoiceFormValue['carrierType'], string> = {
  'mobile-barcode': '手機條碼載具',
  'natural-person-cert': '自然人憑證',
  'company-tax-id': '統編發票',
  donation: '捐贈發票',
  member: '會員載具',
  paper: '紙本發票',
};

export interface InvoiceFormProps {
  /** 當前值。 */
  value?: InvoiceFormValue;
  /** 變更回呼。 */
  onChange?: (value: InvoiceFormValue) => void;
  /** 預設折疊狀態。 */
  defaultCollapsed?: boolean;
  /** 額外 className。 */
  className?: string;
}

/**
 * 發票表單（折疊式）。
 *
 * 預設折疊顯示「會員載具」摘要；展開後可選擇載具類型 + 填入代號。
 */
export function InvoiceForm(props: InvoiceFormProps): JSX.Element {
  const { value, onChange, defaultCollapsed = true, className } = props;
  const [open, setOpen] = useState<boolean>(!defaultCollapsed);

  const current: InvoiceFormValue = value ?? { carrierType: 'member' };

  const update = (patch: Partial<InvoiceFormValue>): void => {
    onChange?.({ ...current, ...patch });
  };

  const needsCode =
    current.carrierType === 'mobile-barcode' ||
    current.carrierType === 'natural-person-cert' ||
    current.carrierType === 'company-tax-id' ||
    current.carrierType === 'donation';

  return (
    <div
      className={[
        'rounded-[14px] border border-black/10 bg-white shadow-sm',
        className ?? '',
      ]
        .join(' ')
        .trim()}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-[14px] p-4 text-left transition-all duration-200 ease-out hover:bg-black/5"
        aria-expanded={open}
      >
        <span className="flex flex-col">
          <span className="text-sm font-medium text-black/90">電子發票</span>
          <span className="text-xs text-black/60">
            {CARRIER_LABEL[current.carrierType]}
            {current.carrierCode ? `：${current.carrierCode}` : ''}
          </span>
        </span>
        <span
          aria-hidden
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          ▾
        </span>
      </button>
      {open ? (
        <div className="flex flex-col gap-3 border-t border-black/5 p-4">
          <label className="flex flex-col gap-1 text-xs text-black/60">
            載具類型
            <select
              value={current.carrierType}
              onChange={(e) =>
                update({
                  carrierType: e.target.value as InvoiceFormValue['carrierType'],
                  carrierCode: undefined,
                  companyTitle: undefined,
                })
              }
              className="rounded-lg border border-black/10 bg-white p-2 text-sm shadow-sm"
            >
              {Object.entries(CARRIER_LABEL).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          {needsCode ? (
            <label className="flex flex-col gap-1 text-xs text-black/60">
              {current.carrierType === 'company-tax-id'
                ? '統一編號'
                : current.carrierType === 'donation'
                  ? '捐贈碼'
                  : '載具代號'}
              <input
                type="text"
                value={current.carrierCode ?? ''}
                onChange={(e) => update({ carrierCode: e.target.value })}
                placeholder={
                  current.carrierType === 'mobile-barcode'
                    ? '/ABC1234'
                    : current.carrierType === 'natural-person-cert'
                      ? 'AB12345678901234'
                      : current.carrierType === 'company-tax-id'
                        ? '12345678'
                        : '5 碼以上捐贈碼'
                }
                className="rounded-lg border border-black/10 bg-white p-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black/20"
              />
            </label>
          ) : null}
          {current.carrierType === 'company-tax-id' ? (
            <label className="flex flex-col gap-1 text-xs text-black/60">
              公司抬頭
              <input
                type="text"
                value={current.companyTitle ?? ''}
                onChange={(e) => update({ companyTitle: e.target.value })}
                placeholder="○○有限公司"
                className="rounded-lg border border-black/10 bg-white p-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black/20"
              />
            </label>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
