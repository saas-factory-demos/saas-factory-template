# @saas-factory/invoice-ezpay

藍新 ezPay 電子發票 Provider。

Lock：ADR-0011 §02-10 v1。AES-256-CBC + 自訂 query string 加密（與 MPG 同算法）。

## 用法

```ts
import { EzpayInvoiceProvider } from '@saas-factory/invoice-ezpay';
import { InvoiceService } from '@saas-factory/invoice-core';

const provider = new EzpayInvoiceProvider({
  merchantId: process.env.EZPAY_MERCHANT_ID!,
  hashKey: process.env.EZPAY_HASH_KEY!,
  hashIv: process.env.EZPAY_HASH_IV!,
  env: 'sandbox',
});

const svc = new InvoiceService({ provider });
await svc.issue({ orderId, tenantId, category: 'B2C', carrier, items, totalAmount });
```
