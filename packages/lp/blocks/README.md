# @saas-factory/lp-blocks

LP 一頁式網站的 18 種區塊 schema 與 props 驗證。

每個 block type 對應一個 Zod schema，定義可編輯欄位 + 預設值 + 驗證規則。

## 支援區塊

| Type | 用途 |
| --- | --- |
| `hero` | 主視覺（標題 + 副標 + 媒體 + CTA） |
| `pain-points` | 痛點清單 |
| `solution` | 解決方案 |
| `features` | 功能特色（2/3/4 欄） |
| `trust-badges` | 信任徽章 / 媒體報導 |
| `before-after` | 使用前後對比 |
| `testimonials` | 客戶見證（文字 / 影片 / 評分） |
| `specs` | 規格表 |
| `faq` | 常見問題 |
| `countdown` | 倒數計時（真實 / 動態） |
| `checkout-form` | 表單結帳（3 段方案 + 多金流） |
| `guarantee` | 退費保證 |
| `contact` | 聯絡資訊 |
| `video` | 影片嵌入（YouTube / Bunny / Mux） |
| `rich-text` | 富文本（markdown / html） |
| `image` | 單張圖片 |
| `gallery` | 圖庫 / 走馬燈 |
| `custom-html` | 自訂 HTML |

## 用法

```ts
import { validateBlock, listBlockTypes } from '@saas-factory/lp-blocks';

const r = validateBlock('hero', { title: '夏季特賣' });
if (r.valid) {
  // r.data 已套用 default 值
} else {
  // r.errors: [{ path, message }]
}
```

`validateBlocks(blocks)` 一次驗證整頁所有 block，給 `lp-builder` 在儲存前後台呼叫。
