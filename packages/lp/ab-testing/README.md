# @saas-factory/lp-ab-testing

LP A/B 測試框架（同一支 LP 多版本，按比例分流 + 顯著性檢定 + 勝出自動上位）。

## 變數類型

- `title`：標題
- `hero-image`：主視覺
- `cta-text`：按鈕文字
- `price-anchor`：價格錨點
- `block`：整個 block 替換

## 用法

```ts
import { AbTestingService, InMemoryExperimentStore, InMemoryAssignmentStore, InMemoryExperimentMetricsStore } from '@saas-factory/lp-ab-testing';

const svc = new AbTestingService(
  new InMemoryExperimentStore(),
  new InMemoryAssignmentStore(),
  new InMemoryExperimentMetricsStore(),
);

// 後台建立實驗
const exp = await svc.create({
  tenantId, pageId,
  name: 'hero title test',
  target: 'title',
  variants: [
    { id: 'A', label: '原版', trafficWeight: 0.5, payload: { title: '舊標題' } },
    { id: 'B', label: '挑戰', trafficWeight: 0.5, payload: { title: '新標題' } },
  ],
  minSamplesPerVariant: 500,
  significanceLevel: 0.05,
});
await svc.start(exp.id);

// LP 渲染時
const variant = await svc.assign(exp.id, visitorId);
// 套用 variant.payload 到對應 block

// 訂單成立
await svc.recordConversion(exp.id, visitorId);

// 後台 / cron 例行檢查
await svc.autoConclude(exp.id);  // 自動 conclude 出顯著贏家

// 看報表
const { stats, significance } = await svc.report(exp.id);
```

## 顯著性檢定

`zTestProportions` 雙樣本 Z-test（兩尾），baseline 預設取 `variants[0]`，每個挑戰者都跟它比，得到 `{ uplift, zScore, pValue, significant }`。
