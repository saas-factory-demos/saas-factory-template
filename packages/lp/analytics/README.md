# @saas-factory/lp-analytics

LP 漏斗 + UTM + CPA / ROAS 分析。

## 6 階段漏斗

`PageView → ViewContent → AddToCart → InitiateCheckout → AddPaymentInfo → Purchase`

事件對齊 Meta Pixel / GA4 / Conversion API，可透過 `trackers` 設定 fan-out 給各家：

```ts
const svc = new LpAnalyticsService(eventStore, spendStore, [
  { name: 'ga4',   send: async (e) => ga4.send(e) },
  { name: 'meta',  send: async (e) => metaPixel.send(e) },
  { name: 'capi',  send: async (e) => conversionApi.send(e) },
]);

await svc.track({
  tenantId, pageId, sessionId, visitorId,
  event: 'Purchase',
  valueMinor: 99000, currency: 'TWD', orderId: 'o1',
  utm: { source: 'facebook', medium: 'cpc', campaign: 'summer-sale' },
  occurredAt: new Date(),
});
```

外掛追蹤器失敗不會影響本地紀錄；回傳 `{ trackerFailures }` 給 Sentry 用。

## 報表

```ts
// 漏斗：每階段 uniqueVisitors + step / overall conversionRate
const funnel = await svc.funnel(tenantId, pageId);

// 按 UTM 分組 + ROAS / CPA（spend 從 recordAdSpend 來）
await svc.recordAdSpend({ tenantId, pageId, campaign: 'summer-sale', spendMinor: 1_000_000, date: '2026-05-15' });
const sources = await svc.sourceReport(tenantId, pageId);
```
