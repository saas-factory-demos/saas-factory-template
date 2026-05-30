# @saas-factory/frontend-copywriter

前台 Factory 的 AI 文案套件。33 個產業 prompt registry + Anthropic Messages API 串接。

## 提供能力

- `PROMPT_REGISTRY`：33 個 `Industry → IndustryPrompt` 字典（systemPrompt + 6 個 blockPrompts + defaults）
- `getIndustryPrompt(industry)`：取得單一產業 prompt
- `renderPromptTemplate(template, variables)`：把 `{{var}}` 佔位換成實際值
- `generateCopy(options)`：呼叫 Anthropic Messages API 生成文案（單次便利函式）
- `AnthropicClient`：可重用的客戶端，內建 rate limit / retry / budget guard
- `TokenBucketRateLimiter` / `BudgetTracker`：底層工具，需要更細控制時可單獨用

## 用法

```ts
import { generateCopy, renderPromptTemplate, getIndustryPrompt } from '@saas-factory/frontend-copywriter';

// 1. 直接生成（伺服器端 / API route）
const copy = await generateCopy({
  industry: 'supplement',
  blockType: 'hero',
  variables: { brandName: '喔喔牌', productName: '葉黃素' },
  // apiKey 可省略，從 env ANTHROPIC_API_KEY 讀
});

// 2. 拿到 prompt 自行串接其他 LLM
const prompt = getIndustryPrompt('beauty-skincare');
const userPrompt = renderPromptTemplate(prompt.blockPrompts.features, {
  productName: '玻尿酸精華',
});
```

## 防呆三件套（rate limit / retry / budget guard）

依 MEMORY「付費 API 部署前的防呆檢查」（源自 OpenClaw 2026-04 燒 $302 案），所有走 Anthropic 的呼叫都必須先套配額上限。本套件提供三層守門：

### 1. Rate limit（token bucket，預設 10 req/min）

```ts
import { AnthropicClient } from '@saas-factory/frontend-copywriter';

const client = new AnthropicClient({
  rateLimit: { capacity: 5, intervalMs: 60_000 }, // 5 req/min
  // 或 rateLimit: false 完全關閉（不建議生產環境用）
});

await client.generateCopy({ industry: 'supplement', blockType: 'hero', variables: {} });
console.log(client.getRemainingQuota()); // 剩餘 token 數
```

超過配額時呼叫端不會看到錯誤，而是 Promise 排隊等下一個 token 補回（避免大量 429）。

### 2. Retry（exponential backoff）

- 5xx + 429 自動重試，預設 3 次、起始延遲 1s、上限 16s
- 429 優先使用 `retry-after` 標頭
- 4xx（非 429）直接 throw `AnthropicAPIError`，不浪費 quota
- 重試達上限後對 429 拋 `RateLimitedError`，5xx 拋 `AnthropicAPIError`

```ts
const client = new AnthropicClient({
  retry: { maxAttempts: 5, baseDelayMs: 2_000, maxDelayMs: 30_000 },
});
```

### 3. Budget guard（累計成本上限）

- 呼叫前：用 `INPUT_COST_PER_MTOK` / `OUTPUT_COST_PER_MTOK` 估算本次成本，若「已用 + 預估 > maxUsd」直接拋 `BudgetExceededError`，不打 API
- 呼叫後：用 Anthropic 回傳的 `usage` 累計實際成本
- 預埋 `claude-opus-4-6`、`claude-sonnet-4-6` 兩種費率；未知 model 走保守 fallback（取最貴值）

```ts
const client = new AnthropicClient({
  budget: { maxUsd: 5, perSession: true },
});

try {
  await client.generateCopy({ ... });
} catch (err) {
  if (err instanceof BudgetExceededError) {
    // 已達當日預算，停止後續呼叫
  }
}

console.log(client.getUsedBudgetUsd()); // 已花費（USD）
client.resetBudget();                   // 換週期歸零
```

### 錯誤類別

全部從 root barrel export：

- `AnthropicAPIError`（含 `status` / `body`）
- `RateLimitedError extends AnthropicAPIError`（含 `retryAfterMs`）
- `BudgetExceededError`（含 `attemptedUsd` / `usedUsd` / `maxUsd`）

## 與 Wizard step 4.8 的對接

Wizard step 4.8（aiCopy 設定）會把使用者填的 `brandVoice / targetAudience / keySellingPoints` 傳入 `generateCopy`：

1. 取得 `WizardOutput.industry` 對應的 `IndustryPrompt`
2. 用 `brandName / brandVoice / targetAudience` 等填 `{{var}}` 佔位
3. 呼叫 `generateCopy` 取回文案，寫回各 block config

## 合規說明

部分產業（醫美、牙醫、律所 / 會計、房地產、夜店、宗教、政治）的 systemPrompt 已內建法規紅線：

- 醫美 / 牙醫：不可寫療效 / before-after / 病患見證、附「依個案評估」提醒
- 律師 / 會計：不可保證勝訴 / 退稅金額
- 房地產：不可虛偽不實 / 絕對性字眼
- 夜店：附「禁酒駕、未滿 18 歲勿飲酒」
- 政治：須符合選罷法與政治獻金法
- AI / Web3：不可承諾收益

## Streaming（`generateCopyStream`）

Anthropic Messages API 的 SSE 串流版本，邊收邊推給瀏覽器。適合 Wizard / Inspector
等需要即時感的 UI；對應 09j-hardening TODO。

```ts
import { AnthropicClient } from '@saas-factory/frontend-copywriter';

const client = new AnthropicClient({ budget: { maxUsd: 0.5 } });

for await (const chunk of client.generateCopyStream({
  industry: 'supplement',
  blockType: 'hero',
  variables: { brandName: '喔喔牌' },
})) {
  if (chunk.type === 'delta') process.stdout.write(chunk.text);
  if (chunk.type === 'done') console.log('\nusage 已 record：', chunk.usageRecorded);
}
```

差別於 `generateCopy`：
- **不走 retry**：stream 中斷已收到部分 chunk，重試會出現重複內容，交由 caller 處理
- rate limit / budget guard **仍生效**（呼叫前估算 + 結尾從 `message_delta.usage` recordActual）
- SSE 由 `parseAnthropicStream(ReadableStream)` 解析（也獨立 export，可用於自訂底層整合）

對應 factory app 端：`POST /api/ai-copy/stream`（與 `/api/ai-copy` 同 body，回 `text/event-stream`）。

## 多語系（CopyLocale）

預設 `zh-TW`（繁體中文＋全形標點，所有 33 prompt 既有設計）。
設 `locale: 'zh-CN' | 'en'` 會在 system prompt 前綴注入語系指令，
Claude 切換語言但保留 prompt 結構（字數限制、CTA、合規措辭）：

```ts
const copy = await generateCopy({
  industry: 'beauty-skincare',
  blockType: 'hero',
  variables: { productName: '玻尿酸精華' },
  locale: 'en', // 自動切美式英文 + ASCII 標點
});

// 簡體大陸用語
const cnCopy = await generateCopy({
  industry: 'saas-software',
  blockType: 'features',
  variables: { brandName: 'PipelineCloud' },
  locale: 'zh-CN', // 軟體→软件、品質→质量、檔案→文件
});
```

設計選擇：不為 33 產業 × 3 語系 × 6 block 寫 594 份 prompt，
改用 prompt prefix 注入 — 維護成本 = 1 個指令，加新語系不必動既有 prompts。
詳見 `src/locale.ts`。

## 指令

```bash
pnpm typecheck
pnpm lint
pnpm test
```

## 依賴

- `@saas-factory/factory-types`：取 `Industry` / `INDUSTRIES`
- 內建 `fetch`：不裝 SDK，bundle 較小，易於測試 mock

## ADR 對齊

- ADR 0099（LLM 串接統一走 Anthropic API）
- goal-09j（frontend-factory 的 AI 文案層）
- goal-09j-hardening（rate limit / retry / budget / streaming / 多語系）
