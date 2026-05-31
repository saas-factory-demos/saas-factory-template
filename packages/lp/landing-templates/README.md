# @saas-factory/lp-landing-templates

5 套 LP 預設範本，給後台「快速建站」入口用。

## 範本

| id | 分類 | 適用 |
|---|---|---|
| `supplement-v1` | 保健食品 | 膠原蛋白、酵素、葉黃素、魚油、益生菌 |
| `electronics-v1` | 3C 配件 | 藍牙耳機、行動電源、快充頭、車載支架、智慧手錶 |
| `course-v1` | 課程預售 | 線上課程、訓練營、工作坊、社團訂閱 |
| `event-v1` | 活動報名 | 講座、研討會、音樂節、展覽、路跑 |
| `service-v1` | 服務預約 | 按摩 SPA、心理諮商、美容護膚、寵物美容、居家清潔 |

每套包含：完整 block 預設、文案 placeholder、配色建議（primary / accent / background / text）。

## 用法

```ts
import {
  LANDING_TEMPLATES,
  getTemplate,
  instantiateTemplate,
  listTemplatesByCategory,
} from '@saas-factory/lp-landing-templates';

// 後台範本選擇器
const allTemplates = LANDING_TEMPLATES;
const supplements = listTemplatesByCategory('supplement');

// 套用範本到新建的草稿（會回深拷貝，可直接修改）
const draft = instantiateTemplate('supplement-v1');
if (draft) {
  draft.defaultBlocks[0].props.headline = '改成客戶自己的標題';
  // 之後丟給 lp/builder 建立新 page
}
```

## 設計原則

- **三段式方案**：所有 checkout-form 都提供 3 個價格選項（錨定效應），中間預設為 `highlighted: true`。
- **block 順序**：依 LP 黃金結構排列 — hero → 痛點 → 解決方案 → 信任 → 見證 → 規格 → FAQ → 倒數 → 結帳 → 保證。
- **placeholder 寫真實感**：不用「Lorem ipsum」，用台灣電商常見文案結構，客戶直接改字就能上。
- **配色**：每套有自己的色調（保健食品偏暖、3C 偏暗夜、課程紫橘、活動紅、服務綠棕）。
