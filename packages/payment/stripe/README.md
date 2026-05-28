# @saas-factory/payment-stripe

Stripe Checkout（hosted）+ Subscription + Webhook 驗簽。

實作直接走 Stripe REST API（無 SDK 依賴），方便 monorepo bundle 縮小 + 測試注入。

## 使用

```ts
import { StripeProvider } from '@saas-factory/payment-stripe';

const provider = new StripeProvider({
  secretKey: process.env.STRIPE_SECRET_KEY!,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  priceIdByOrder: (orderId) => priceIdMap[orderId],
});

const charge = await provider.charge({
  orderId: 'O-001',
  tenantId: 't1',
  method: 'stripe-card',
  amount: { amount: 9999, currency: 'USD' },
  idempotencyKey: 'O-001-charge',
  returnUrl: 'https://app/done',
  cancelUrl: 'https://app/cancel',
});
// redirect 用戶到 charge.redirectUrl
```

## Webhook 驗簽

`verifyStripeSignature(rawBody, sigHeader, webhookSecret)`：
- 解析 `t=...,v1=...,v1=...` header
- 比對 HMAC-SHA256(`${t}.${rawBody}`, secret)
- 預設容差 300 秒（防 replay）

## 對應 ADR

- ADR-0011 §02-01：Stripe 為必備（國外案 + 訂閱）
- ADR-0011 §02-09：webhook 驗簽
