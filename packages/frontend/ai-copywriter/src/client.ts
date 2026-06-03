import {
  BudgetTracker,
  estimateCostUsd,
  estimateTokens,
  getModelPricing,
} from './budget.js';
import { AnthropicAPIError, RateLimitedError } from './errors.js';
import { DEFAULT_LOCALE, applyLocaleToSystemPrompt, type CopyLocale } from './locale.js';
import { getIndustryPrompt } from './prompts/index.js';
import { TokenBucketRateLimiter } from './rate-limiter.js';
import { renderPromptTemplate } from './render.js';
import { parseAnthropicStream } from './stream.js';

import type {
  AnthropicClientOptions,
  BlockType,
  GenerateCopyOptions,
  RetryOptions,
} from './types.js';

/** Anthropic Messages API endpoint。 */
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

/** Anthropic API 版本標頭（依官方規範固定字串）。 */
const ANTHROPIC_VERSION = '2023-06-01';

/** 預設模型（ADR 0099 規定走 Anthropic claude-opus-4 系列）。 */
const DEFAULT_MODEL = 'claude-opus-4-6';

/** 預設 max tokens。 */
const DEFAULT_MAX_TOKENS = 1024;

/** 預設 retry 次數。 */
const DEFAULT_RETRY_ATTEMPTS = 3;
/** 預設 backoff 起始延遲（毫秒）。 */
const DEFAULT_BASE_DELAY_MS = 1_000;
/** 預設 backoff 上限延遲（毫秒）。 */
const DEFAULT_MAX_DELAY_MS = 16_000;

/** Anthropic Messages API 回傳結構（只取 content text 部分 + usage）。 */
interface AnthropicTextBlock {
  type: 'text';
  text: string;
}

interface AnthropicUsage {
  input_tokens?: number;
  output_tokens?: number;
}

interface AnthropicMessageResponse {
  content?: Array<AnthropicTextBlock | { type: string }>;
  error?: { type: string; message: string };
  usage?: AnthropicUsage;
}

/**
 * 取得 API key：優先用呼叫端傳入，否則 fallback 到 `process.env.ANTHROPIC_API_KEY`。
 * 若都沒有 → throw。
 */
function resolveApiKey(explicit?: string): string {
  if (explicit && explicit.length > 0) {
    return explicit;
  }
  const fromEnv =
    typeof process !== 'undefined' && process.env ? process.env.ANTHROPIC_API_KEY : undefined;
  if (fromEnv && fromEnv.length > 0) {
    return fromEnv;
  }
  throw new Error('ANTHROPIC_API_KEY 未設定：請透過 options.apiKey 或環境變數提供。');
}

/** 預設睡眠：用 setTimeout 包成 Promise。 */
function defaultSleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/** 解析 Anthropic 429 回傳的 `retry-after` 標頭（秒）→ 毫秒。 */
function parseRetryAfter(response: Response): number | null {
  const header = response.headers.get('retry-after');
  if (!header) {
    return null;
  }
  const seconds = Number(header);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return Math.round(seconds * 1000);
  }
  // 也支援 HTTP date 格式
  const dateMs = Date.parse(header);
  if (!Number.isNaN(dateMs)) {
    return Math.max(0, dateMs - Date.now());
  }
  return null;
}

/** 計算 exponential backoff 第 N 次重試的等待時間（毫秒）。 */
function backoffDelay(attempt: number, base: number, max: number): number {
  return Math.min(max, base * 2 ** attempt);
}

/**
 * Anthropic Messages API 客戶端。
 *
 * 集中管理：
 * - rate limit（token bucket，預設 10 req/min，可關閉）
 * - retry（5xx + 429，exponential backoff，預設 3 次）
 * - budget guard（呼叫前估算 + 呼叫後累計實際成本）
 *
 * 用法：
 * ```ts
 * const client = new AnthropicClient({
 *   apiKey: process.env.ANTHROPIC_API_KEY,
 *   budget: { maxUsd: 5 },
 * });
 * const copy = await client.generateCopy({ industry, blockType, variables });
 * console.log(client.getUsedBudgetUsd(), client.getRemainingQuota());
 * ```
 */
export class AnthropicClient {
  private readonly apiKey: string | undefined;
  private readonly model: string;
  private readonly fetchImpl: typeof fetch | undefined;
  private readonly maxTokens: number;
  private readonly rateLimiter: TokenBucketRateLimiter | null;
  private readonly retryOptions: Required<Omit<RetryOptions, 'sleep'>> & {
    sleep: (ms: number) => Promise<void>;
  };
  private readonly budget: BudgetTracker | null;
  private readonly locale: CopyLocale;

  public constructor(options: AnthropicClientOptions = {}) {
    this.apiKey = options.apiKey;
    this.model = options.model ?? DEFAULT_MODEL;
    this.fetchImpl = options.fetchImpl;
    this.maxTokens = options.maxTokens ?? DEFAULT_MAX_TOKENS;
    this.rateLimiter =
      options.rateLimit === false ? null : new TokenBucketRateLimiter(options.rateLimit ?? {});
    const r = options.retry ?? {};
    this.retryOptions = {
      maxAttempts: r.maxAttempts ?? DEFAULT_RETRY_ATTEMPTS,
      baseDelayMs: r.baseDelayMs ?? DEFAULT_BASE_DELAY_MS,
      maxDelayMs: r.maxDelayMs ?? DEFAULT_MAX_DELAY_MS,
      sleep: r.sleep ?? defaultSleep,
    };
    this.budget = options.budget ? new BudgetTracker(options.budget) : null;
    this.locale = options.locale ?? DEFAULT_LOCALE;
  }

  /**
   * 呼叫 Anthropic Messages API 生成單一 block 文案。
   *
   * 流程：
   * 1. 組 prompt（system + user）
   * 2. 預算守門：估算成本，超過 maxUsd 直接 throw `BudgetExceededError`
   * 3. Rate limit：取 token（不夠則排隊等待）
   * 4. 帶 retry 的 fetch：4xx 直 throw；429 / 5xx 走 backoff
   * 5. 累計實際成本
   */
  public async generateCopy(
    options: Omit<GenerateCopyOptions, keyof AnthropicClientOptions>,
  ): Promise<string> {
    const { industry, blockType, variables } = options;
    const prompt = getIndustryPrompt(industry);
    const blockTemplate = prompt.blockPrompts[blockType as BlockType];
    const rawSystemPrompt = renderPromptTemplate(prompt.systemPrompt, variables);
    const systemPrompt = applyLocaleToSystemPrompt(rawSystemPrompt, this.locale);
    const userPrompt = renderPromptTemplate(blockTemplate, variables);

    // 預算守門：呼叫前先估
    if (this.budget) {
      const pricing = getModelPricing(this.model);
      const { inputTokens, outputTokens } = estimateTokens(
        systemPrompt.length + userPrompt.length,
        this.maxTokens,
      );
      const estimate = estimateCostUsd(pricing, inputTokens, outputTokens);
      this.budget.assertWithinBudget(estimate);
    }

    // Rate limit：等到拿到 token 才繼續
    if (this.rateLimiter) {
      await this.rateLimiter.acquire();
    }

    const data = await this.fetchWithRetry(systemPrompt, userPrompt);

    if (data.error) {
      throw new Error(`Anthropic API 錯誤（${data.error.type}）：${data.error.message}`);
    }

    // 累計實際成本（若拿不到 usage 就跳過，避免低估的同時也避免 NaN）
    if (this.budget && data.usage) {
      const pricing = getModelPricing(this.model);
      const actual = estimateCostUsd(
        pricing,
        data.usage.input_tokens ?? 0,
        data.usage.output_tokens ?? 0,
      );
      this.budget.recordActual(actual);
    }

    const textBlock = data.content?.find(
      (block): block is AnthropicTextBlock => block.type === 'text' && 'text' in block,
    );
    if (!textBlock) {
      throw new Error('Anthropic API 回傳格式錯誤：找不到 text block。');
    }
    return textBlock.text;
  }

  /**
   * Streaming 版本（09j-hardening TODO）。
   *
   * 依序 yield 文字 chunk，最後 yield `{ type: 'done', fullText, usage? }`。
   * 流式呼叫不走 retry（一旦開始 stream 中斷就交由 caller 處理）；
   * rate limit / budget guard 仍生效（呼叫前估算 + 結束後 recordActual）。
   *
   * 用法：
   * ```ts
   * for await (const chunk of client.generateCopyStream({ ... })) {
   *   if (chunk.type === 'delta') write(chunk.text);
   *   if (chunk.type === 'done') console.log('完整文案：', chunk.fullText);
   * }
   * ```
   */
  public async *generateCopyStream(
    options: Omit<GenerateCopyOptions, keyof AnthropicClientOptions>,
  ): AsyncGenerator<
    { type: 'delta'; text: string } | { type: 'done'; fullText: string; usageRecorded: boolean },
    void,
    void
  > {
    const { industry, blockType, variables } = options;
    const prompt = getIndustryPrompt(industry);
    const blockTemplate = prompt.blockPrompts[blockType as BlockType];
    const rawSystemPrompt = renderPromptTemplate(prompt.systemPrompt, variables);
    const systemPrompt = applyLocaleToSystemPrompt(rawSystemPrompt, this.locale);
    const userPrompt = renderPromptTemplate(blockTemplate, variables);

    // 預算守門：先估
    if (this.budget) {
      const pricing = getModelPricing(this.model);
      const { inputTokens, outputTokens } = estimateTokens(
        systemPrompt.length + userPrompt.length,
        this.maxTokens,
      );
      const estimate = estimateCostUsd(pricing, inputTokens, outputTokens);
      this.budget.assertWithinBudget(estimate);
    }

    // Rate limit：等到拿到 token 才繼續
    if (this.rateLimiter) {
      await this.rateLimiter.acquire();
    }

    const key = resolveApiKey(this.apiKey);
    const doFetch = this.fetchImpl ?? globalThis.fetch;
    if (typeof doFetch !== 'function') {
      throw new Error('找不到可用的 fetch：請在 Node 20+ 執行，或傳入 options.fetchImpl。');
    }

    const response = await doFetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': ANTHROPIC_VERSION,
        accept: 'text/event-stream',
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: this.maxTokens,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
        stream: true,
      }),
    });

    if (!response.ok) {
      const body = await safeReadText(response);
      if (response.status === 429) {
        throw new RateLimitedError(response.status, body, null);
      }
      throw new AnthropicAPIError(response.status, body);
    }
    if (!response.body) {
      throw new Error('Anthropic streaming 回應沒有 body');
    }

    let fullText = '';
    let usageRecorded = false;
    for await (const event of parseAnthropicStream(response.body)) {
      if (event.type === 'text') {
        fullText += event.text;
        yield { type: 'delta', text: event.text };
      } else if (event.type === 'usage') {
        if (this.budget) {
          const pricing = getModelPricing(this.model);
          const actual = estimateCostUsd(pricing, event.inputTokens, event.outputTokens);
          this.budget.recordActual(actual);
          usageRecorded = true;
        }
      } else if (event.type === 'error') {
        throw new AnthropicAPIError(0, event.message);
      }
    }
    yield { type: 'done', fullText, usageRecorded };
  }

  /** 取得目前剩餘 rate limit token（關閉 rate limit 時回傳 Infinity）。 */
  public getRemainingQuota(): number {
    return this.rateLimiter ? this.rateLimiter.getRemaining() : Number.POSITIVE_INFINITY;
  }

  /** 取得已累計的實際成本（USD）；未啟用 budget 時回傳 0。 */
  public getUsedBudgetUsd(): number {
    return this.budget ? this.budget.getUsedUsd() : 0;
  }

  /** 重置預算累計（未啟用 budget 時為 no-op）。 */
  public resetBudget(): void {
    if (this.budget) {
      this.budget.reset();
    }
  }

  /** 真正打 Anthropic 的核心，帶 retry。 */
  private async fetchWithRetry(
    systemPrompt: string,
    userPrompt: string,
  ): Promise<AnthropicMessageResponse> {
    const key = resolveApiKey(this.apiKey);
    const doFetch = this.fetchImpl ?? globalThis.fetch;
    if (typeof doFetch !== 'function') {
      throw new Error('找不到可用的 fetch：請在 Node 20+ 執行，或傳入 options.fetchImpl。');
    }

    const requestInit: RequestInit = {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: this.maxTokens,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    };

    const { maxAttempts, baseDelayMs, maxDelayMs, sleep } = this.retryOptions;
    let lastError: unknown;

    // 首次 + maxAttempts 次重試
    for (let attempt = 0; attempt <= maxAttempts; attempt += 1) {
      try {
        const response = await doFetch(ANTHROPIC_API_URL, requestInit);
        if (response.ok) {
          return (await response.json()) as AnthropicMessageResponse;
        }

        const body = await safeReadText(response);

        // 429：用 retry-after 優先，否則走 backoff
        if (response.status === 429) {
          const retryAfter = parseRetryAfter(response);
          if (attempt >= maxAttempts) {
            throw new RateLimitedError(response.status, body, retryAfter);
          }
          const delay = retryAfter ?? backoffDelay(attempt, baseDelayMs, maxDelayMs);
          await sleep(delay);
          continue;
        }

        // 5xx：走 backoff
        if (response.status >= 500 && response.status < 600) {
          if (attempt >= maxAttempts) {
            throw new AnthropicAPIError(response.status, body);
          }
          await sleep(backoffDelay(attempt, baseDelayMs, maxDelayMs));
          continue;
        }

        // 其他 4xx：直接 throw，不重試
        throw new AnthropicAPIError(response.status, body);
      } catch (err) {
        // 我們自己丟出的 AnthropicAPIError / RateLimitedError 已經是最終錯誤
        if (err instanceof AnthropicAPIError) {
          throw err;
        }
        // 其他例外（network error 等）也走 retry
        lastError = err;
        if (attempt >= maxAttempts) {
          throw err;
        }
        await sleep(backoffDelay(attempt, baseDelayMs, maxDelayMs));
      }
    }

    // 理論上不會到這（迴圈內必 return 或 throw），保底
    throw lastError ?? new Error('Anthropic 重試達上限但未取得結果。');
  }
}

/**
 * 串接 Anthropic Messages API，依產業 + block 類型生成文案。
 *
 * 此函式為 `AnthropicClient` 的方便包裝：
 * - 每次呼叫會 new 一個 client，client 級設定（rateLimit / retry / budget）只在這次呼叫內生效
 * - 若需要跨呼叫累計預算 / 共享 rate limit，請直接 new `AnthropicClient`
 *
 * @throws `AnthropicAPIError` / `RateLimitedError` / `BudgetExceededError` 詳見 `errors.ts`。
 */
export async function generateCopy(options: GenerateCopyOptions): Promise<string> {
  const {
    industry,
    blockType,
    variables,
    apiKey,
    model,
    fetchImpl,
    maxTokens,
    rateLimit,
    retry,
    budget,
    locale,
  } = options;
  const client = new AnthropicClient({
    apiKey,
    model,
    fetchImpl,
    maxTokens,
    rateLimit,
    retry,
    budget,
    locale,
  });
  return client.generateCopy({ industry, blockType, variables });
}

/** 嘗試讀 response.text，失敗時回傳空字串避免 throw 蓋掉原始錯誤。 */
async function safeReadText(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch {
    return '';
  }
}
