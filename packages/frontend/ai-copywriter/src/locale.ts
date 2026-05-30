/**
 * AI 文案多語系變體（09j-hardening TODO 收尾）。
 *
 * 設計選擇：不為 33 個產業 × 3 語系 × 6 block 各寫 594 份 prompt，
 * 改在 system prompt 前綴注入語系指令，請 LLM 依照原本繁中 prompt 結構生成
 * 對應語系內容。
 *
 * 好處：
 * - 維護成本 = 1 個指令；新加語系不必動既有 33 prompts
 * - 文案結構（字數限制、CTA 風格、訴求重點）跨語系一致
 * - 不犧牲 prompt 工程品質
 *
 * 代價：
 * - 依賴 Claude 跨語系翻譯品質（實測 zh-TW → en / zh-CN 在繁中 prompt 描述下表現良好）
 * - 半形 / 全形標點 / 用語在地化需明示指令避免 LLM 偷懶照搬
 */

/** 支援的文案語系。 */
export type CopyLocale = 'zh-TW' | 'zh-CN' | 'en';

/** 預設語系。 */
export const DEFAULT_LOCALE: CopyLocale = 'zh-TW';

/**
 * 將語系指令前綴到 system prompt。
 *
 * - `zh-TW`：直接回原 prompt（既有 prompt 已是繁中）
 * - `zh-CN`：強制簡體 + 半形標點 + 大陸用語
 * - `en`：強制英文 + ASCII 標點 + 美式英文
 */
export function applyLocaleToSystemPrompt(systemPrompt: string, locale: CopyLocale): string {
  if (locale === 'zh-TW') return systemPrompt;
  const instruction = LOCALE_INSTRUCTIONS[locale];
  return `${instruction}\n\n---\n\n${systemPrompt}`;
}

/** 各語系的 system prompt 前綴指令（繁中描述以對齊既有 prompt 風格）。 */
const LOCALE_INSTRUCTIONS: Record<Exclude<CopyLocale, 'zh-TW'>, string> = {
  'zh-CN':
    '【語系指令｜最高優先】請以**簡體中文（中國大陸地區）**回覆所有文案。標點符號採用**半形**（，。：；、）。用語務必在地化：軟體→软件、品質→质量、影片→视频、行銷→营销、預設→默认、登入→登录、滑鼠→鼠标、檔案→文件。文案結構（字數限制、CTA、訴求重點、合規措辭）一律保留下方產業 prompt 的設定。',
  en: '[Locale Directive | Highest Priority] Respond entirely in natural American English. Use standard ASCII punctuation (no full-width 全形). Keep all copy structure constraints from the industry prompt below (character/word counts, CTA style, compliance phrasing) — only the language and punctuation switch. Idioms and tone must read as if written by a native English copywriter, not a translation.',
};
