/** 實驗狀態。 */
export type ExperimentStatus = 'draft' | 'running' | 'paused' | 'concluded';

/** 變數類型：哪一層可以做 A/B。 */
export type VariantTarget = 'title' | 'hero-image' | 'cta-text' | 'price-anchor' | 'block';

/** 單一變體。 */
export interface ExperimentVariant {
  id: string;
  label: string;
  /** 流量分配比例（0~1，加總必須 = 1）。 */
  trafficWeight: number;
  /** 對應實驗變數的內容（例如標題字串、price block 設定）。 */
  payload: Record<string, unknown>;
}

/** LP A/B 實驗設定。 */
export interface Experiment {
  id: string;
  tenantId: string;
  pageId: string;
  name: string;
  target: VariantTarget;
  variants: ExperimentVariant[];
  status: ExperimentStatus;
  startedAt?: Date;
  concludedAt?: Date;
  /** 自動上位的最低樣本數（每組）。 */
  minSamplesPerVariant: number;
  /** 顯著性門檻（p value）。 */
  significanceLevel: number; // e.g. 0.05
  /** 勝出 variant id（若已 conclude）。 */
  winningVariantId?: string;
}

/** 單一 variant 累計資料。 */
export interface VariantStats {
  variantId: string;
  visitors: number;
  conversions: number;
  /** conversions / visitors。 */
  conversionRate: number;
}

/** 顯著性檢定結果（雙樣本 Z-test）。 */
export interface SignificanceResult {
  baselineId: string;
  challengerId: string;
  /** 提升幅度（challenger / baseline - 1）。 */
  uplift: number;
  zScore: number;
  pValue: number;
  significant: boolean;
}
