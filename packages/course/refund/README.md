# @saas-factory/course-refund

課程退費：7 天鑑賞期 + 30% 觀看閾 + 按比例 + 自動連動發票折讓。

## 政策（合規重點）

- **鑑賞期**：預設 7 天（台灣消保法第 19 條）
- **30% 觀看閾**：鑑賞期內觀看 < 30% 才能全額退（避免「看完就退」）
- **過鑑賞期**：可按 `remaining-lessons` 或 `remaining-days` 比例退費
- **發票折讓**：核准時自動呼叫 `invoice.issueAllowance()`，部分退款 → 部分折讓單

## 使用

```ts
import { RefundService, InMemoryRefundStore } from '@saas-factory/course-refund';

const svc = new RefundService(
  new InMemoryRefundStore(),
  async ({ orderId, refundAmountMinor, reason }) => {
    // 由 invoice 模組實作
    return { allowanceId: 'A12345' };
  },
);

// 前台試算「可退多少」
const eligibility = await svc.checkEligibility({
  tenantId, courseId, orderId,
  amountMinor: 100000, paidAt, watchedRatio: 0.1,
});

// 學員提出申請
const req = await svc.createRequest({ ...同上, reason: 'cooling-off' });

// 後台核准 → 自動開折讓單
await svc.approve(req.id);

// 金流退款 callback 成功
await svc.markRefunded(req.id);
```

## 流程

```
pending → approved（開折讓單） → refunded（金流退款）
       ↘ rejected（rejectionReason）
```
