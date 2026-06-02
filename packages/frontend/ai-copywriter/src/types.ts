import type { BudgetOptions } from './budget.js';
import type { CopyLocale } from './locale.js';
import type { RateLimiterOptions } from './rate-limiter.js';
import type { Industry } from '@saas-factory/factory-types';

/** AI 文案語氣枚舉。 */
export type CopyTone = 'professional' | 'friendly' | 'playful' | 'luxurious' | 'urgent';

/** Block 類型 key，對應 LP / Shop 主要 block 文案需求。 */
export type BlockType = 'hero' | 'features' | 'testimonials' | 'pricing' | 'faq' | 'cta';

/** 各 block 的 user prompt template，含 {{var}} 佔位符。 */
export interface BlockPromptMap {
  hero: string;
  features: string;
  testimonials: string;
  pricing: string;
  faq: string;
  cta: string;
}

/** 單一產業的 prompt 設定。 */
export interface IndustryPrompt {
  /** 對應的產業 slug。 */
  industry: Industry;
  /** 系統提示詞（給 LLM 設定角色、產業背景、限制）。 */
  systemPrompt: string;
  /** 各 block / page 用的 user prompt template，含變數佔位符如 {{brandName}}。 */
  blockPrompts: BlockPromptMap;
  /** 預設文案風格參數。 */
  defaults: {
    brandVoice: string;
    targetAudience: string;
    tone: CopyTone;
  };
}

/** 重試策略設定。 */
export interface RetryOptions {
  /** 最多重試幾次（不含首次呼叫），預設 3。 */
  maxAttempts?: number;
  /** Exponential backoff 起始延遲（毫秒），預設 1000。 */
  baseDelayMs?: number;
  /** Exponential backoff 上限延遲（毫秒），預設 16000。 */
  maxDelayMs?: number;
  /** 注入睡眠函式（測試用），預設用 setTimeout。 */
  sleep?: (ms: number) => Promise<void>;
}

/**
 * `AnthropicClient` 的建構選項。
 *
 * 與 `generateCopy(options)` 共用：把 client 級別的設定（rate limit / retry / budget）
 * 集中在這個型別，呼叫端可以直接 new client 一次、重複呼叫 `generateCopy()`。
 */
export interface AnthropicClientOptions {
  /** Anthropic API key；未提供時將從 env `ANTHROPIC_API_KEY` 讀取。 */
  apiKey?: string;
  /** 指定模型，預設 `claude-opus-4-6`。 */
  model?: string;
  /** 自訂 fetch（測試用注入），預設使用 globalThis.fetch。 */
  fetchImpl?: typeof fetch;
  /** 最大輸出 tokens，預設 1024。 */
  maxTokens?: number;
  /**
   * Rate limit 設定。
   * - 物件：傳給 token bucket（預設 10 req/min）
   * - false：完全關閉 rate limit
   * - 不傳：使用預設值
   */
  rateLimit?: RateLimiterOptions | false;
  /** Retry 設定（5xx + 429）。 */
  retry?: RetryOptions;
  /** 預算守門設定。 */
  budget?: BudgetOptions;
  /**
   * 文案語系，預設 `zh-TW`。
   * 設為 `zh-CN` / `en` 時，會在 system prompt 前綴注入語系指令，
   * Claude 會依此切換輸出語言；既有 33 個產業 prompt 結構保留。
   */
  locale?: CopyLocale;
}

/** `generateCopy` 的呼叫選項（包含 client 級設定 + 單次呼叫所需 industry / blockType）。 */
export interface GenerateCopyOptions extends AnthropicClientOptions {
  /** 產業 slug，用以取得對應 prompt。 */
  industry: Industry;
  /** 想生成的 block 類型。 */
  blockType: BlockType;
  /** 模板變數，用來填充 systemPrompt / blockPrompts 內的 {{var}} 佔位符。 */
  variables: Record<string, string>;
}
