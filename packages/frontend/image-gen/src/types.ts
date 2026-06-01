import type { DarkModePreference, DensityPreference, FontPreference, Industry, PresetKey, RadiusPreference } from '@saas-factory/factory-types';

/**
 * 生圖 provider 識別碼（env `IMAGE_GEN_PROVIDER` 對應）。
 *
 * - `openai`：OpenAI gpt-image-2（2026-04-21，含 reasoning「thinking mode」、多語文字渲染強）
 * - `gemini`：Google Gemini 3.1 Flash Image Preview（俗稱 Nano Banana 2，2026-02-26）
 * - `mock`：離線確定性 stub，給測試 / dry-run / demo 用（不呼叫外部 API、零成本）
 */
export type ImageProvider = 'openai' | 'gemini' | 'mock';

/**
 * 生圖長寬比。對應網站不同 image slot 的版型需求。
 *
 * 不直接收任意數值是為了讓 prompt-builder / curator 能對 slot 類型做穩定假設，
 * 也避免把奇怪比例餵給 model 產生變形圖。
 */
export type AspectRatio = '16:9' | '4:3' | '3:2' | '1:1' | '9:16' | '3:4';

/**
 * 網站 image slot 類型 —— 決定長寬比、prompt 取景、curator 偏好。
 *
 * - `hero-background`：首屏大圖 / 背景，重氣氛與留白（給文字疊放）
 * - `feature-icon`：功能點小圖示 / 插畫，重簡潔、單一主體、透明或純色背景
 * - `gallery`：作品 / 環境 / 商品情境照，重質感與真實感
 * - `portrait`：人物 / 團隊 / 講師頭像情境，重自然光與專業感
 * - `generic`：其餘內容區搭配圖
 */
export type ImageSlotKind =
  | 'hero-background'
  | 'feature-icon'
  | 'gallery'
  | 'portrait'
  | 'generic';

/**
 * 從 wizard 抽出的「網站風格描述」——餵進 prompt-builder 讓生圖與網站氣質對齊。
 *
 * 為何獨立成型別：把「wizard schema」與「生圖 prompt 輸入」解耦，
 * 之後 wizard 欄位調整不會直接污染 prompt 邏輯。
 */
export interface ImageStyleProfile {
  /** 產業（決定題材 / 場景語彙）。 */
  industry: Industry;
  /** 設計 preset（決定整體視覺語言，如 editorial / playful / luxury）。 */
  preset: PresetKey;
  /** 主色（hex，餵進 prompt 引導色調）。 */
  primaryColor: string;
  /** 輔色（hex）。 */
  accentColor: string;
  /** 圓角偏好（影響「柔和 / 銳利」氛圍描述）。 */
  radius: RadiusPreference;
  /** 字體偏好（sans / serif / display / mixed → 對應現代 / 經典 / 個性氛圍）。 */
  font: FontPreference;
  /** 密度偏好（compact / normal / spacious → 對應緊湊 / 留白氛圍）。 */
  density: DensityPreference;
  /** 暗色偏好（影響整體明暗基調）。 */
  darkMode: DarkModePreference;
  /** 由 preset / industry 推導出的氛圍形容詞（如 ['minimal','airy','premium']）。 */
  mood: string[];
}

/** 單次生圖請求。 */
export interface ImageGenRequest {
  /** 已組好的生圖 prompt（由 prompt-builder 產出，或呼叫端自備）。 */
  prompt: string;
  /** 長寬比。 */
  aspectRatio: AspectRatio;
  /** 要生幾張（best-of-N 的 N）。 */
  count: number;
  /** slot 類型（curator 評分用；可選）。 */
  slotKind?: ImageSlotKind;
  /** 額外風格提示詞（會併進 prompt 尾段；可選）。 */
  styleHints?: string[];
  /** negative prompt（避免出現的元素，如浮水印 / 文字；可選，部分 provider 支援）。 */
  negativePrompt?: string;
}

/** 單張生圖結果（storage-agnostic：回 base64 bytes，由呼叫端決定上傳何處）。 */
export interface ImageGenResult {
  /** base64 編碼的圖片 bytes（不含 data: 前綴）。 */
  b64: string;
  /** MIME 類型，如 `image/png`。 */
  mimeType: string;
  /** 實際使用的 model id。 */
  model: string;
  /** 本張的估算成本（USD）。 */
  costUsd: number;
  /** 圖寬（px，若 provider 回傳）。 */
  width?: number;
  /** 圖高（px，若 provider 回傳）。 */
  height?: number;
  /** 隨機種子（若 provider 回傳，利於重現）。 */
  seed?: number;
  /** provider 改寫後的 prompt（如 OpenAI revised_prompt；利於除錯）。 */
  revisedPrompt?: string;
}

/**
 * 生圖 adapter 介面 —— 每個 provider 實作一份，env-driven 切換。
 *
 * 設計（與既有金流 / 物流 / copywriter adapter 同模式）：
 * - 不綁單一廠商：generator / 後台只依賴此介面，換 provider 只換實作
 * - `generate` 回 `request.count` 張（best-of-N 的 N），由 curator 挑最佳
 * - `estimateCostUsd` 給 budget 守門在「呼叫前」估算，超預算直接擋
 */
export interface ImageGenAdapter {
  /** provider 識別碼。 */
  readonly provider: ImageProvider;
  /** 實際使用的 model id（env 可覆寫）。 */
  readonly model: string;
  /** 生 `request.count` 張圖。 */
  generate(request: ImageGenRequest): Promise<ImageGenResult[]>;
  /** 呼叫前成本預估（USD），給 budget 守門用。 */
  estimateCostUsd(request: ImageGenRequest): number;
}
