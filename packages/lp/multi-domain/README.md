# @saas-factory/lp-multi-domain

多 LP 同後台，每支 LP 繫結獨立 custom domain（或 subdomain），訂單統一管理。

## 流程

1. 後台 `addDomain({ tenantId, pageId, domain })` → 拿到 `verificationToken`
2. 客戶在自己 DNS 加 TXT 記錄：`_saas-factory.<domain> TXT <token>`
3. 後台 `verify(id)` → 透過 `dnsResolver` hook 查 TXT，命中就標 `verified`
4. Next.js middleware 用 `resolveDomain(req.headers.host)` 對應到 pageId 渲染對應 LP

## 用法

```ts
import { LpMultiDomainService, InMemoryLpDomainBindingStore } from '@saas-factory/lp-multi-domain';

const svc = new LpMultiDomainService(new InMemoryLpDomainBindingStore(), {
  dnsResolver: async (host) => (await dns.resolveTxt(host)).map((r) => r.join('')),
});

const b = await svc.addDomain({ tenantId, pageId, domain: 'product-a.example.com' });
// 顯示給客戶：「請在 _saas-factory.product-a.example.com 加 TXT 記錄：${b.verificationToken}」
await svc.verify(b.id);

// middleware
const route = await svc.resolveDomain(req.headers.host);
if (route) {
  request.headers.set('x-tenant-id', route.tenantId);
  request.headers.set('x-page-id', route.pageId);
}
```

## 注意

- domain 寫入前統一 normalize（去 scheme、轉小寫、去尾 slash）。
- 同 page 最多一個 `isPrimary=true`，用於產出標準分享連結。
