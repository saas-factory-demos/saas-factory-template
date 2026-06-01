/** LP 範本分類。 */
export type TemplateCategory =
  | 'supplement' // 保健食品
  | 'electronics' // 3C 配件
  | 'course' // 課程預售
  | 'event' // 活動報名
  | 'service'; // 服務預約

/** 配色建議（後台可微調）。 */
export interface BrandColors {
  /** 主色（CTA 按鈕、強調區）。 */
  primary: string;
  /** 輔色（標題、icon）。 */
  accent: string;
  /** 背景色。 */
  background: string;
  /** 內文色。 */
  text: string;
}

/** 範本內的單一 block 預設。 */
export interface TemplateBlock {
  type: string;
  props: Record<string, unknown>;
}

/** LP 範本。 */
export interface LandingTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  /** 一句話描述。 */
  description: string;
  /** 適用情境（給後台選擇器顯示）。 */
  suitableFor: string[];
  /** 建議配色。 */
  brandColors: BrandColors;
  /** 預設 block 清單（順序即渲染順序）。 */
  defaultBlocks: TemplateBlock[];
}
