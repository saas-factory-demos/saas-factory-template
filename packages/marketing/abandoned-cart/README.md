# @saas-factory/marketing-abandoned-cart

棄單回收服務。3 段跟催 + 多通路 fan-out + quota 防作弊 + 漏斗指標。

## 用法

```ts
import {
  AbandonedCartService,
  DEFAULT_RECOVERY_FLOW,
  InMemoryRecoveryAttemptStore,
  InMemoryCouponClaimStore,
} from '@saas-factory/marketing-abandoned-cart';

const svc = new AbandonedCartService(
  new InMemoryRecoveryAttemptStore(),
  new InMemoryCouponClaimStore(),
  {
    async send(channel, snapshot, { templateId, couponCode }) {
      if (channel === 'email') return emailService.send(snapshot.customerEmail, templateId, { couponCode });
      if (channel === 'line') return lineService.push(snapshot.customerLine, templateId, { couponCode });
      return smsService.send(snapshot.customerPhone, templateId, { couponCode });
    },
  },
);

// 上游 cart 服務偵測到 abandoned 時
await svc.scheduleRecovery(snapshot, DEFAULT_RECOVERY_FLOW);

// 上游 cart 服務偵測到恢復活動時
await svc.cancelByCart(cartId, '客戶恢復活動');

// Cron / worker 每分鐘拉一次
await svc.dispatchDue(tenantId, DEFAULT_RECOVERY_FLOW, new Date());

// 上游 email tracker / 訂單成立時回寫
await svc.recordOutcome(attemptId, 'email', 'opened');
await svc.recordOutcome(attemptId, 'email', 'converted');

// 後台報表
const stats = await svc.funnelStats(tenantId);
// { scheduled, sent, opened, clicked, converted, clickRate, conversionRate, recoveredRevenueMinor }
```

## 預設流程（DEFAULT_RECOVERY_FLOW）

| 段 | 延遲 | 通路 | 折扣碼 |
|---|---|---|---|
| 1 | 1 小時 | Email | — |
| 2 | 24 小時 | Email | COMEBACK5 |
| 3 | 72 小時 | Email + LINE | COMEBACK10 |

`maxDiscountPerCustomerPerMonth` 預設 1：同客戶每月只能領一次棄單折扣（防客戶刻意棄單）。超 quota 時仍寄信但不附碼。

## 與 automation-engine 的整合

可不用 engine（直接呼 svc.scheduleRecovery + 自家 worker）也可包成 automation-engine 的 action：

```ts
engine.createWorkflow({
  tenantId,
  name: '棄單回收',
  trigger: { event: 'cart.abandoned' },
  steps: [
    { kind: 'action', action: 'schedule-cart-recovery' },
  ],
});

// actions['schedule-cart-recovery'] = async (params, ctx) => {
//   await svc.scheduleRecovery(ctx.cart, DEFAULT_RECOVERY_FLOW);
//   return { ok: true };
// };
```
