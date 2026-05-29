# @saas-factory/frontend-image-gen

依網站風格自動生成高質感搭配圖的 provider-agnostic 生圖引擎（goal-12 / ADR-0101）。

## 用途

把 wizard 的產業 / preset / 配色 / 字體 / 密度 / 暗色偏好轉成生圖 prompt，
對網站各 image slot（hero 背景、features 圖示、gallery、人物…）生成風格一致的圖，
best-of-N 自動挑最佳，並以每站預算守門控成本。

設計原則：**不被綁住**——所有 provider 走 `ImageGenAdapter` 介面，換 provider 只改一個 env。

## 安裝

monorepo 內部 workspace 套件，於需要的 app / package 加：

```jsonc
// package.json
{ "dependencies": { "@saas-factory/frontend-image-gen": "workspace:*" } }
```

## Provider 與 env

| Provider | env `IMAGE_GEN_PROVIDER` | model（env 可覆寫） | API key env |
|---|---|---|---|
| OpenAI gpt-image-2 | `openai` | `OPENAI_IMAGE_MODEL`（預設 `gpt-image-2`） | `OPENAI_API_KEY` |
| Gemini Nano Banana 2 | `gemini` | `GEMINI_IMAGE_MODEL`（預設 `gemini-3.1-flash-image-preview`） | `GEMINI_API_KEY`（或 `GOOGLE_AI_API_KEY`） |
| Mock（離線 / 測試） | `mock`（預設） | — | 無 |

未設 `IMAGE_GEN_PROVIDER` → 預設 `mock`（零成本、不打外部 API，dry-run / demo 不阻塞）。

## 開發指令

```bash
pnpm --filter @saas-factory/frontend-image-gen typecheck
pnpm --filter @saas-factory/frontend-image-gen lint
pnpm --filter @saas-factory/frontend-image-gen test
```

## 用法

```ts
import {
  buildStyleProfile,
  buildImagePrompt,
  collectImageSlots,
  createImageGenAdapter,
  generateBestImage,
  ImageBudgetTracker,
  DEFAULT_IMAGE_BUDGET_USD,
} from '@saas-factory/frontend-image-gen';

const profile = buildStyleProfile(wizard);
const slots = collectImageSlots(wizard.frontend.pages);
const adapter = createImageGenAdapter(); // 依 IMAGE_GEN_PROVIDER 切
const budget = new ImageBudgetTracker({ maxUsd: DEFAULT_IMAGE_BUDGET_USD }); // 每站 $2

for (const slot of slots) {
  const { prompt, negativePrompt, aspectRatio } = buildImagePrompt({
    slotKind: slot.slotKind,
    subject: slot.subject,
    styleProfile: profile,
  });
  const { best } = await generateBestImage(
    adapter,
    { prompt, negativePrompt, aspectRatio, count: 4 },
    { budget },
  );
  // best.b64 / best.mimeType → 由呼叫端上傳 R2、寫回 slot.path
}
```

## 設計取捨

- **storage-agnostic**：本套件只回 base64 bytes，不直接依賴 R2 / S3 SDK；
  上傳由呼叫端（generator step）以既有 R2 設定處理 → 套件純函式、好測。
- **best-of-N**：每位置生 N 張，`curator` 以啟發式（長寬比符合 + 相對 byte 數）挑最佳；
  初版不接 vision model 評美學（成本翻倍），預留 `scoreImages` 介面日後擴充。
- **per-image 預算**：生圖以張計價（非 token），故自帶精簡 `ImageBudgetTracker`，
  不複用 copywriter 的 token-based BudgetTracker。
- **model id env 化**：provider 換代（gpt-image-3 / Nano Banana 3…）只改 env，不動程式碼。

## 已知限制 / TODO

- curator 啟發式評分僅初版；要更穩可接 vision model 評構圖 / 美學。
- prompt 模板目前對 33 產業共用一套 mood 對照（依 preset），高頻 slot 已足夠；
  細分各產業專屬 prompt 為後續工作。
- 後台「隨選生成」API（`/api/factory/generate-image`）與 UI 為 follow-up。
