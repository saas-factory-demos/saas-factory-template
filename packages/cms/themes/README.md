# @saas-factory/cms-themes

5 個內建主題（每個都自訂 component variants，每個 block 在不同主題下顯示差異明顯）。

## 5 個主題

| key | 形容 | 適合 |
| --- | --- | --- |
| `modern-minimal` | 黑白灰 + 留白 + 細邊框 | 科技 / SaaS / 顧問 |
| `luxury` | 深色 + 香檳金 + 襯線字 | 精品 / 高端服務 / 餐飲 |
| `playful` | 鮮豔 + 大圓角 + 手寫風 | 電商 / 生活 / 寵物 / 親子 |
| `corporate` | 藍色穩重 + 嚴謹排版 | 企業 / 金融 / B2B |
| `academy` | 暖色 + 襯線 heading | 線上課程 / 教育 / 知識付費 |

## 結構

每個 `ThemeDefinition` 包含：

- `palette`：15 種顏色（background / foreground / surface / primary / accent / success / warning / danger 等）
- `typography`：fontSans / fontSerif / fontMono / headingScale / bodySize / lineHeight / fontWeight
- `radii`：sm / md / lg / xl / 2xl / full（依 CLAUDE.md 規範）
- `shadows`：sm / md / lg / xl
- `spacing`：unit + sectionPaddingY
- `componentVariants`：10 種 block 的 class 字串（button / card / hero / section / testimonial / team / pricing / faq / badge / input）

## 使用

```ts
import {
  ThemeRegistry,
  themeToCssVars,
  allThemesCss,
  luxuryTheme,
} from '@saas-factory/cms-themes';

// 取單一主題的 class
const heroTitleClass = luxuryTheme.componentVariants.hero.title;

// 產生 CSS 變數（單主題）
const css = themeToCssVars(luxuryTheme);

// 同站台多主題切換（每個主題用 data-theme 區隔）
const css = allThemesCss(new ThemeRegistry().list());
// 套上 <body data-theme="luxury"> 即可切換
```

## 指令

```
pnpm typecheck
pnpm lint
pnpm test
```
