# @saas-factory/frontend-tokens

前台 Factory Design Tokens 套件。20 套風格 preset 的視覺地基，提供：

- `DesignTokens` 介面（11 個 category：meta / colors / typography / radius / spacing / shadow / motion / density / interaction / effects / breakpoints）
- `generateColorScale`：chroma-js LCH 色彩空間，從單一品牌色生成 11 階（50-950）HSL 字串
- `generateCSSVariables`：將 `DesignTokens` 序列化成可注入 `:root` 或 `[data-preset="xxx"]` 的 CSS Variables 字串
- Preset registry：20 套 preset 字典（目前已實作 3 套 demo，09b 後續批次補完 20）

## 設計鎖邊界（重要）

依 ADR 0015：

- 本 package 是 design token 系統的 **source of truth**。
- 未來如需上抽到 `packages/core/design-tokens` 跨前台 / 客戶後台 / Email template 共用，需開新 ADR。
- 所有 preset 必須包含 CLAUDE.md 第四節五階段 `--radius-sm/md/lg/xl/2xl` 變數作 backward-compat。
- 與既有 `packages/ui` 完全獨立、不互相 import。

## 用法

```ts
import { presets, generateCSSVariables, generateColorScale } from '@saas-factory/frontend-tokens';

// 取得 preset
const tokens = presets['modern-minimal'];

// 生成 CSS Variables（可寫入 globals.css）
const css = generateCSSVariables(tokens);

// 從單色生 11 階
const scale = generateColorScale('#3b82f6');
// → { 50: '220 100% 97%', 100: '...', ..., 950: '...' }
```

## 開發

```bash
pnpm --filter @saas-factory/frontend-tokens typecheck
pnpm --filter @saas-factory/frontend-tokens lint
pnpm --filter @saas-factory/frontend-tokens test
```

## 進度

- 09b：3 套 demo preset（modern-minimal / luxury-editorial / organic-wellness）+ 完整 schema
- 後續：補完 20 套 preset、回填 `INDUSTRY_METADATA.recommendedPresetId`
