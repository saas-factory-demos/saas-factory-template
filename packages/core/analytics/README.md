# @saas-factory/analytics

多平台追蹤：GA4 / Meta Pixel / Meta CAPI / TikTok / LINE Tag / GTM。對應 goal 01 §5。

## 標準事件

對齊 Meta Pixel 規範：

`PageView` / `ViewContent` / `AddToCart` / `InitiateCheckout` / `AddPaymentInfo` / `Purchase` / `Lead` / `CompleteRegistration` / `Search` / `AddToWishlist` / `Subscribe`

## 用法

```typescript
import {
  MultiProviderAnalyticsService,
  Ga4Provider,
  MetaPixelProvider,
  MetaCapiProvider,
} from '@saas-factory/analytics';

const analytics = new MultiProviderAnalyticsService({
  providers: [
    new Ga4Provider(),
    new MetaPixelProvider(),
    new MetaCapiProvider({ pixelId: process.env.META_PIXEL_ID!, accessToken: process.env.META_CAPI_TOKEN! }),
  ],
});

await analytics.trackPurchase({
  orderId: 'O-1234',
  value: 1500,
  currency: 'TWD',
  items: [{ id: 'P-1', quantity: 1, price: 1500 }],
  context: { email: user.email, eventId: 'evt-uuid' },
});
```

## Client + Server dedupe

iOS 14+ 後 client-side pixel 損失嚴重。Purchase 等關鍵事件**必須同時送 client（pixel）+ server（CAPI）**，並用同一個 `eventId` 讓 Meta dedupe。

## PII 雜湊

`hashEmail` / `hashPhone` 對應 Meta CAPI 要求的 SHA-256 規則（email lowercase + trim、phone 去除非數字）。

## 指令

```bash
pnpm typecheck
pnpm lint
pnpm test
```
