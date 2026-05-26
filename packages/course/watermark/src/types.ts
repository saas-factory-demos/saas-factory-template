/** 觀眾識別資訊（顯示在浮水印上的個資來源）。 */
export interface WatermarkViewer {
  /** 觀眾使用者 ID（給後續追溯用，不顯示）。 */
  userId: string;
  /** 觀眾 Email（顯示時會遮罩中段）。 */
  email?: string;
  /** 觀眾手機尾 4 碼（若無 email 則優先顯示這個）。 */
  phoneLast4?: string;
  /** 顯示名稱（會附加在文字最前面）。 */
  displayName?: string;
}

/** 浮水印位置（畫面九宮格）。 */
export type WatermarkPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'middle-left'
  | 'middle-center'
  | 'middle-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

/** 單一浮水印片段（一段時間內固定的位置 + 文字）。 */
export interface WatermarkFrame {
  /** 起始秒（含）。 */
  startSeconds: number;
  /** 結束秒（不含）。 */
  endSeconds: number;
  /** 該段顯示的位置。 */
  position: WatermarkPosition;
  /** 顯示文字（已遮罩處理）。 */
  text: string;
  /** 半透明度（0 ~ 1）。 */
  opacity: number;
}

/** 浮水印生成選項。 */
export interface WatermarkOptions {
  /** 影片總時長（秒）。 */
  durationSeconds: number;
  /** 每段持續秒數（預設 5）。 */
  segmentSeconds?: number;
  /** 半透明度（預設 0.35）。 */
  opacity?: number;
  /** 允許出現的位置（預設九宮格全部，排除 middle-center 避開字幕）。 */
  allowedPositions?: WatermarkPosition[];
  /** 隨機種子（同一觀眾 + 同一影片應該得到一樣的序列，便於還原 / 追蹤）。 */
  seed?: string;
}
