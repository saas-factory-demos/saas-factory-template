# @saas-factory/payment-core

金流抽象層：定義 `PaymentProvider` 介面、`PaymentRouter`、Money（minor unit + ISO 4217）、訂閱重試策略。

各 provider（newebpay / ecpay / stripe 等）實作此介面，由 router 依 method 路由。

## 概念

- `PaymentMethod`：19 種扣款方式（credit / atm / cvs / linepay / stripe-card …）
- `PaymentProvider`：介面（charge / refund / parseWebhook / createSubscription）
- `PaymentRouter`：依 `MethodRouting` 對應 provider，首選失敗自動 fallback
- `IdempotencyStore`：webhook / charge 去重
- `Money`：金額一律 minor unit + ISO 4217（02-10）
- `DEFAULT_SUBSCRIPTION_RETRY`：D+1 / D+3 / D+7（02-08）

## 使用

```ts
import { PaymentRouter, toMinorUnit } from '@saas-factory/payment-core';
import { NewebPayProvider } from '@saas-factory/payment-newebpay';

const router = new PaymentRouter({
  providers: [new NewebPayProvider(config)],
  routing: { credit: ['newebpay'], atm: ['newebpay'] },
});

await router.charge({
  orderId: 'O-001',
  tenantId: 't1',
  method: 'credit',
  amount: toMinorUnit(990, 'TWD'),
  idempotencyKey: 'O-001-charge',
});
```

## 對應 ADR

- ADR-0011 §02-01 ~ §02-10：lock 的 10 條金流預設
