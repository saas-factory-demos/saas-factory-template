# @saas-factory/shop-returns

退換貨流程模組。

## 狀態流

```
pending → approved → received → refunded
                              → exchanged
       → rejected
       → cancelled
```

## 功能

- 退換貨原因（含統計分類）。
- 部分退款（指定 items 與 refundAmount）。
- 換貨流程（新單關聯 exchangeOrderId）。
- 退貨運費規則（merchant / customer）。
- 7 天鑑賞期合規旗標（建立時自動標記）。
- 發票折讓：呼叫 caller 注入的 `InvoiceAllowanceIssuer.issueAllowance`，串 goal 02 invoice-core，本 goal 不擴充發票 schema。

## 使用

```ts
import { ReturnService, InMemoryReturnStore } from '@saas-factory/shop-returns';

const service = new ReturnService(store, { emit, coolingPeriodDays: 7 });
const r = await service.createRequest(input);
await service.approve(r.id);
await service.markReceived(r.id);
await service.completeRefund({ id: r.id, invoiceId, issuer: invoiceCore });
```

## 指令

```
pnpm typecheck
pnpm lint
pnpm test
```
