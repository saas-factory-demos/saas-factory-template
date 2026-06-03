/** 顯示裝置。 */
export type DeviceVariant = 'mobile' | 'desktop';

/** 桌機呈現模式。 */
export type DesktopPlacement = 'bottom-right-float' | 'sticky-follow';

/** 多語系 CTA 文字。 */
export interface CtaLabelMap {
  /** 例：{ 'zh-TW': '立即購買 NT$890', en: 'Buy now $29' } */
  [locale: string]: string;
}

/** Floating CTA 設定。 */
export interface FloatingCtaConfig {
  tenantId: string;
  pageId: string;
  enabled: boolean;
  /** 行動裝置：底部固定 bar；桌機：依 desktopPlacement。 */
  desktopPlacement: DesktopPlacement;
  /** 多語系文字（key = locale，含 currency 動詞）。 */
  labels: CtaLabelMap;
  /** 行為價（minor），用於 fallback 字串生成。 */
  priceMinor?: number;
  /** 貨幣（顯示用）。 */
  currency?: string;
  /** 點擊要跳到的 anchor（例：#checkout）。 */
  targetAnchor: string;
  /** 捲動到此 anchor 後自動隱藏，避免和區段重複。 */
  hideOnAnchorVisible: boolean;
  /** 至少捲過多少 px 才顯示（避免 hero 就跳出來打擾）。 */
  showAfterScrollPx: number;
}

/** 可見性判斷輸入。 */
export interface VisibilityInput {
  /** 目前捲動 px。 */
  scrollY: number;
  /** target anchor 是否在 viewport 內。 */
  anchorInView: boolean;
  /** 結帳區是否已露出（自動隱藏條件）。 */
  checkoutVisible: boolean;
}

/** 解析後的 CTA 顯示資料（給前台直接 render）。 */
export interface ResolvedCta {
  visible: boolean;
  reason?: string;
  device: DeviceVariant;
  label: string;
  targetAnchor: string;
  /** 顯示位置（前台對應 className）。 */
  placement: 'mobile-bottom-bar' | DesktopPlacement;
}
