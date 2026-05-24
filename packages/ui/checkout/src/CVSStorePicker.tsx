import type { CvsStore } from './types.js';
import type { JSX } from 'react';


const BRAND_LABEL: Record<CvsStore['brand'], string> = {
  '7eleven': '7-ELEVEN',
  'family-mart': '全家',
  hilife: '萊爾富',
};

export interface CvsStorePickerProps {
  /** 已選門市；若為空顯示選擇按鈕。 */
  store?: CvsStore;
  /** 點擊「選擇門市」回呼，通常由父層開啟 ECPay／黑貓地圖選店頁。 */
  onPick?: () => void;
  /** 點擊「清除門市」回呼。 */
  onClear?: () => void;
  /** 額外 className。 */
  className?: string;
}

/**
 * 超商門市選擇器。
 *
 * 未選擇時顯示 CTA 按鈕；已選擇時顯示門市卡片 + 重新選擇。
 */
export function CvsStorePicker(props: CvsStorePickerProps): JSX.Element {
  const { store, onPick, onClear, className } = props;

  if (!store) {
    return (
      <button
        type="button"
        onClick={onPick}
        className={[
          'flex w-full items-center justify-center rounded-[14px] border border-dashed border-black/20 bg-white p-6 text-sm font-medium text-black/70 shadow-sm',
          'transition-all duration-200 ease-out hover:border-black/40 hover:bg-black/5 hover:shadow-md',
          className ?? '',
        ]
          .join(' ')
          .trim()}
      >
        選擇取貨門市
      </button>
    );
  }

  return (
    <div
      className={[
        'flex flex-col gap-3 rounded-[14px] border border-black/10 bg-white p-4 shadow-sm',
        className ?? '',
      ]
        .join(' ')
        .trim()}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="inline-flex w-fit items-center rounded-full bg-black/5 px-2 py-0.5 text-xs text-black/70">
            {BRAND_LABEL[store.brand]}
          </span>
          <span className="text-sm font-semibold text-black/90">
            {store.storeName}（{store.storeId}）
          </span>
          <span className="text-xs text-black/60">{store.address}</span>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onPick}
          className="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-xs shadow-sm transition-all duration-200 ease-out hover:shadow-md"
        >
          重新選擇
        </button>
        {onClear ? (
          <button
            type="button"
            onClick={onClear}
            className="rounded-lg px-3 py-1.5 text-xs text-black/60 transition-all duration-200 ease-out hover:text-black/90"
          >
            清除
          </button>
        ) : null}
      </div>
    </div>
  );
}
