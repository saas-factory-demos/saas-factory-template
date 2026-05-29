# @saas-factory/frontend-blocks

SaaS Factory 前端 Tier 1 block 元件庫。一份 schema、一個 React 元件、5-8 個 variant，給 Wizard / template-writer / Storybook 共用。

## 包含什麼

20 個 Tier 1 高頻 block，每個 block 都附：

- Zod schema（驗證 config）
- React 元件（內部依 `variant` 切換 5-8 個版型）
- `*Defaults`：給 Wizard 預填的預設 props
- `*_VARIANTS`：variant slug 列表
- 透過 `BLOCK_REGISTRY` 統一暴露給 Wizard / template-writer

| Key | 中文名稱 |
| --- | --- |
| `hero` | 首屏 Hero |
| `header` | 頁首導覽 |
| `footer` | 頁尾 |
| `features-grid` | 功能特色 |
| `stats` | 數據統計 |
| `testimonials` | 客戶見證 |
| `cta` | 行動呼籲 CTA |
| `faq` | 常見問題 |
| `logo-cloud` | 客戶 Logo 牆 |
| `content-section` | 內容區塊 |
| `pricing-table` | 方案訂價 |
| `team` | 團隊成員 |
| `timeline` | 時間軸 |
| `gallery` | 圖庫 |
| `newsletter` | 電子報訂閱 |
| `contact` | 聯絡我們 |
| `breadcrumb` | 麵包屑導覽 |
| `tabs-section` | 頁籤區塊 |
| `steps` | 流程步驟 |
| `banner` | 橫幅 Banner |

## 設計原則

1. **Schema-driven**：所有 block 透過 Zod schema 描述 props 形狀，Wizard / AI 產出的 config 都會先 `safeParse` 才進元件。
2. **Variant-rich**：每個 block 內含 5-8 個版型，由 `variant` 欄位切換，避免 props 爆炸。
3. **Theme-aware**：100% 走 CSS variable token（`hsl(var(--color-primary-500))`、`var(--radius-xl)`、`var(--shadow-card)` 等），不寫死任何顏色或圓角。
4. **Animation-ready**：所有 block 透過 `SectionContainer` / `MotionWrapper` 自動讀取 `useMotionLevel`，搭配 `motion.variant`（`fadeIn` / `slideUp` / `slideRight` / `scale`）與 `motion.delay`。
5. **Atomic-on-shadcn**：盡量用 `@saas-factory/frontend-primitives` 的 `Card` / `Button` / `Input` / `Accordion` / `Tabs` / `Avatar` 等原子元件，不重複造輪子。

## 安裝

monorepo 內透過 workspace 引入：

```jsonc
{
  "dependencies": {
    "@saas-factory/frontend-blocks": "workspace:*"
  }
}
```

## 使用範例

```tsx
import { Hero, heroSchema, heroDefaults, BLOCK_REGISTRY } from '@saas-factory/frontend-blocks';

// 直接渲染：
<Hero {...heroDefaults} />

// Wizard / template-writer 透過 registry 動態渲染：
const entry = BLOCK_REGISTRY['hero'];
const validated = entry.schema.safeParse(userConfig);
if (validated.success) {
  const Component = entry.component;
  return <Component {...validated.data} />;
}
```

## 開發指令

```bash
pnpm --filter @saas-factory/frontend-blocks lint
pnpm --filter @saas-factory/frontend-blocks typecheck
pnpm --filter @saas-factory/frontend-blocks test
```

## 與其他套件的關係

- `@saas-factory/factory-types`：提供 `FrontendTier1BlockKey`、`BlockInstance` 等核心型別。
- `@saas-factory/frontend-tokens`：CSS variable token 來源（顏色／圓角／陰影）。
- `@saas-factory/frontend-primitives`：shadcn/Radix 原子元件。
- `@saas-factory/frontend-motion`：`MotionWrapper`、`useMotionLevel`、`motionVariants`。
- `@saas-factory/frontend-industry-templates`（09f）：使用本套件 block + dotted slug variant 組成 33 個產業範本。
- `@saas-factory/frontend-wizard`（後續 goal）：消費 `BLOCK_REGISTRY` 在 Wizard UI 中選用 block。

## 限制 / TODO

- Banner 的 `endsAt` 倒數目前只渲染 ISO 字串，真實倒數行為留給後續 goal（需要 client-side hook）。
- 部分 block（如 `team.departments-tabs`、`tabs-section.compact-bar`）的互動細節仰賴 `frontend-primitives` 的 `Tabs` / `Accordion` 既有行為，未做特化。
- 視覺 regression 測試（Storybook + Chromatic）排在 09g。
