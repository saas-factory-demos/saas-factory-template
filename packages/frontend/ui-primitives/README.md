# @saas-factory/frontend-primitives

前台 Factory UI Primitive 套件。Tier 1 共 20 個 shadcn / Radix 風格基礎元件，全部走 `@saas-factory/frontend-tokens` 注入的 CSS Variables（不寫死顏色 / radius）。

## 元件清單

| 類型 | 元件 |
|---|---|
| Form（8） | Button、Input、Textarea、Label、Checkbox、RadioGroup、Switch、Select |
| Display（5） | Card、Badge、Avatar、Separator、Skeleton |
| Overlay（4） | Dialog、Sheet、Popover、Tooltip |
| Navigation（2） | Tabs、Accordion |
| Feedback（1） | Toast |

## 設計原則

- **CSS Variables only**：所有色彩用 `hsl(var(--color-primary-500))` 等格式，radius 用 `var(--radius-button)` / `var(--radius-card)` 等。Token 來源由 `@saas-factory/frontend-tokens` 的 `generateCSSVariables` 提供。
- **Radix UI primitive**：互動 / 無障礙交給 `@radix-ui/*`，本套件只負責樣式 + 組裝。
- **CVA + cn**：variant 用 `class-variance-authority`、className 用 `clsx` + `tailwind-merge`。
- **不裝 Tailwind**：本套件只輸出 className 字串，Tailwind 4 由客戶站專案編譯。

## 用法

```tsx
import { Button, Card, CardHeader, CardTitle } from '@saas-factory/frontend-primitives';

export function Example() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>標題</CardTitle>
      </CardHeader>
      <Button variant="default">點我</Button>
    </Card>
  );
}
```

## 開發指令

```bash
pnpm typecheck
pnpm lint
pnpm test
```
