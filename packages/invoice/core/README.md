# @saas-factory/invoice-core

台灣電子發票模組核心抽象。

Lock：ADR-0011 §02-10 v1。goal 02 接收所有權，後續 goal 03 / 04 / 05 只 consume。

## 包含

- `InvoiceProvider` 介面（ezpay / ecpay-invoice 兩家 provider 共用契約）
- `InvoiceService` orchestrator（呼叫 provider + 發出 domain event）
- Payload collection：`invoices` / `invoice-allowances` / `invoice-logs`
- 載具驗證器：手機條碼、自然人憑證、統編、愛心碼
- 統編 checksum 驗算

## 使用

```ts
import { InvoiceService } from '@saas-factory/invoice-core';
import { EzpayInvoiceProvider } from '@saas-factory/invoice-ezpay';

const svc = new InvoiceService({
  provider: new EzpayInvoiceProvider({ ... }),
  emit: bus.publish,
});

await svc.issue({ orderId, tenantId, category: 'B2C', carrier: { type: 'mobile-barcode', value: '/ABCD123' }, items, totalAmount });
```
