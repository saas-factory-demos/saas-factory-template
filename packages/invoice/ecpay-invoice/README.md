# @saas-factory/invoice-ecpay

綠界電子發票 B2C v3 Provider。

Lock：ADR-0011 §02-10 v1。AES-128-CBC + base64 + URL encode（與 ECPay AIO 同套規格）。

## 用法

```ts
import { EcpayInvoiceProvider } from '@saas-factory/invoice-ecpay';
import { InvoiceService } from '@saas-factory/invoice-core';

const provider = new EcpayInvoiceProvider({
  merchantId: process.env.ECPAY_INVOICE_MERCHANT_ID!,
  hashKey: process.env.ECPAY_INVOICE_HASH_KEY!,
  hashIv: process.env.ECPAY_INVOICE_HASH_IV!,
  env: 'sandbox',
});

const svc = new InvoiceService({ provider });
await svc.issue({ orderId, tenantId, category: 'B2C', carrier, items, totalAmount });
```
