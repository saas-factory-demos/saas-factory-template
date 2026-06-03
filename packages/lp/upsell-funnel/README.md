# @saas-factory/lp-upsell-funnel

One-Click Upsell 多層 funnel 狀態機 + 事件統計。

## 流程

```
訂單成立（hasStoredPayment=true）
  → OTO 1：start() / peek() 顯示 offer
    accept() → 用既有付款憑證一鍵扣款 → 前進
    skip()   → 直接前進
  → OTO 2 ...
  → 感謝頁（done=true）
```

沒有付款憑證或沒有 OTO 設定，`start()` 直接拋到感謝頁。

## 用法

```ts
import { UpsellFunnelService, InMemoryUpsellSessionStore, InMemoryUpsellEventStore } from '@saas-factory/lp-upsell-funnel';

const svc = new UpsellFunnelService(new InMemoryUpsellSessionStore(), new InMemoryUpsellEventStore(), {
  // 用先前訂單的 Stripe customer / TapPay token 重扣
  charge: async ({ orderId, offer, effectivePriceMinor }) => stripe.upsellCharge(orderId, offer.productId, effectivePriceMinor),
});

const { session, step } = await svc.start({ orderId, config, hasStoredPayment: true });
if (step.kind === 'offer') {
  // 渲染 OTO 頁
}

// 使用者點「接受」
await svc.accept(session.id);
// 或「跳過」
await svc.skip(session.id);

// 後台分析
const stats = await svc.statsOf(tenantId, offerId); // { views, accepts, skips, acceptRate }
```

## 注意

- 扣款 hook 失敗（卡片過期、額度不足）會 throw，cursor 不前進，前端可顯示錯誤後讓使用者跳過。
- 每次 `peek()` 都會 +1 view（包含 `start()` 與 `accept`/`skip` 之後的 peek）。
