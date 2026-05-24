/** 偵測來源（瀏覽器事件由前端轉成這四種）。 */
export type ExitTrigger =
  | 'mouse-leave-top'
  | 'mobile-scroll-up'
  | 'mobile-back-button'
  | 'tab-blur';

/** 觸發時要顯示的彈窗內容（後台可編輯 + A/B）。 */
export interface ExitIntentVariant {
  id: string;
  /** 流量分配權重（>0）。 */
  weight: number;
  headline: string;
  body: string;
  ctaLabel: string;
  /** 接受時要核發的折扣碼模板 id。 */
  couponTemplateId: string;
}

/** Exit-intent 設定（每個 LP 一份）。 */
export interface ExitIntentConfig {
  tenantId: string;
  pageId: string;
  enabled: boolean;
  /** 允許的觸發來源。 */
  triggers: ExitTrigger[];
  /** 顯示前的最小停留秒數（避免 bounce 太快觸發）。 */
  minDwellSeconds: number;
  /** 同一訪客的冷卻時間（秒）；同一 visitor 重複觸發要等久一點。 */
  cooldownSeconds: number;
  /** 觸發後在同一 session 內最多顯示幾次。 */
  maxShowPerSession: number;
  /** A/B 變體（至少 1 個）。 */
  variants: ExitIntentVariant[];
}

/** 留資訊換折扣 payload。 */
export interface LeadCapturePayload {
  email?: string;
  phone?: string;
}

/** 觸發判斷結果。 */
export type ExitDecision =
  | { show: false; reason: string }
  | { show: true; variantId: string };

/** 訪客在 session 內的觸發狀態（外層用 cookie / KV 存）。 */
export interface VisitorExitState {
  visitorId: string;
  tenantId: string;
  pageId: string;
  /** 已捕獲過 lead 則永久 suppress。 */
  hasCaptured: boolean;
  /** 該 session 已顯示次數。 */
  shownCount: number;
  /** 上次觸發時間。 */
  lastShownAt?: Date;
  /** 上次選到的 variant。 */
  lastVariantId?: string;
}
