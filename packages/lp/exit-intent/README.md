# @saas-factory/lp-exit-intent

LP 離站挽留：偵測使用者要離開時彈窗送折扣 + 留資。

## 觸發來源（由前端轉成事件）

- `mouse-leave-top`：游標往視窗上方移出（桌機）
- `mobile-scroll-up`：行動裝置快速上滑
- `mobile-back-button`：按返回鍵
- `tab-blur`：分頁失焦

## 抑制規則

`decide()` 依序檢查：
1. 設定停用 → 不顯示
2. trigger 不在允許清單 → 不顯示
3. 訪客已轉換（下過單）→ 不顯示
4. 停留秒數不足 `minDwellSeconds` → 不顯示
5. 已留 lead → 永久 suppress
6. 已顯示次數 ≥ `maxShowPerSession` → 不顯示
7. 距上次觸發 < `cooldownSeconds` → 不顯示

過了才按 `variants[].weight` 比例選一個變體並計入觸發統計。

## 用法

```ts
import { ExitIntentService, InMemory{VisitorExitState,ExitLead,ExitStats}Store } from '@saas-factory/lp-exit-intent';

const svc = new ExitIntentService(stateStore, leadStore, statsStore, {
  couponIssue: async ({ tenantId, templateId, email, phone }) => coupons.issueFromTemplate(tenantId, templateId, { email, phone }),
});

const d = await svc.decide(config, { visitorId, trigger: 'mouse-leave-top', dwellSeconds: 20, hasConverted: false });
if (d.show) {
  // 前端渲染對應 variant
  // 使用者送出表單時
  const coupon = await svc.captureLead(config, visitorId, { email });
}
```

## 統計

`statsOf(tenantId, pageId)` → 每個 variant 的 `{ triggers, captures, conversionRate }`，供後台 A/B 看板。
