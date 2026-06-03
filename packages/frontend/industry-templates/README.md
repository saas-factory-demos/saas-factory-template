# @saas-factory/frontend-industries

33 個產業的完整 site template，給 Wizard step 1.5「Industry 選擇」用。

## 內容

- `IndustryTemplate` interface：每個產業的 `primarySiteType` / `pages` / `extraModules` / `copyTone`
- `INDUSTRY_TEMPLATES: Record<Industry, IndustryTemplate>`：33 條全填
- `getIndustryTemplate(industry)`：取單一 template
- `mergeWithMetadata(industry)`：合併 `INDUSTRY_METADATA` 與 `INDUSTRY_TEMPLATES`，回 Wizard view object

## 使用

```ts
import {
  getIndustryTemplate,
  mergeWithMetadata,
} from '@saas-factory/frontend-industries';

const tpl = getIndustryTemplate('supplement');
// → { industry, primarySiteType, pages, extraModules?, copyTone }

const view = mergeWithMetadata('supplement');
// → 同時拿到 displayName / recommendedPresetId / recommendedSiteTypes /
//   recommendedModules（合併過）/ primarySiteType / pages / copyTone
```

## 開發

```bash
pnpm typecheck
pnpm lint
pnpm test
```

## TODO

- `BlockInstance.type` 目前用字串 slug（例：`'hero.split'`）。等 09e `blocks-library` 完成後會收緊成 enum 並補實際 config schema
- `BlockInstance.config` 目前為空 object，待 AI Copywriter 接管後填入實際文案
- 33 個 template 目前只填了 primary site type 的 pages，其他 site type 留空陣列；後續可視需求擴充
