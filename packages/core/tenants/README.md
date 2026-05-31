# @saas-factory/tenants

多租戶隔離契約實作。對應 ADR-0007。

## 隔離契約（後續所有 goal 必須遵守）

1. **業務 collection 必經 `tenantScoped()`** —— 自動加 `tenantId` 必填欄位 + access hooks
2. **全域 collection** —— 列在 `GLOBAL_COLLECTIONS` 白名單者不過 tenant filter
3. **跨 tenant 操作** —— 僅 `owner` 角色 + `context.bypassTenant = true` 才允許；操作必同步寫 audit log
4. **tenant id 來源優先序** —— `req.context.tenantId` > cookie `currentTenantId` > `user.tenants[0]`

## 使用

### 1. 註冊 Tenants collection

```typescript
import { TenantsCollection } from '@saas-factory/tenants';

export default buildConfig({
  collections: [TenantsCollection /* ... */],
});
```

### 2. 業務 collection 套 `tenantScoped`

```typescript
import { tenantScoped } from '@saas-factory/tenants';

const Orders = tenantScoped({
  slug: 'orders',
  fields: [
    { name: 'total', type: 'number' },
    // ... tenantId 會被 tenantScoped 自動加在最前面
  ],
});
```

### 3. 切換 tenant

前台呼叫 `POST /api/tenants/switch`（goal 01 §9 提供），server 寫 cookie `currentTenantId`。

### 4. 跨 tenant 報表 / 系統工作

```typescript
await payload.find({
  collection: 'orders',
  req: {
    user: { ...ownerUser },
    context: { bypassTenant: true },
  } as PayloadRequest,
});
```

bypass 操作必須額外呼叫 `auditRecorder.record({ crossTenant: true, ... })`。

## 全域 collection 清單

| Slug              | 理由                                         |
| ----------------- | -------------------------------------------- |
| `system-settings` | 全租戶共用系統參數                            |
| `email-templates` | 預設 Email 模板（客戶可 fork 出 tenant 版） |
| `audit-logs`      | 跨 tenant 稽核紀錄                            |
| `users`           | 員工，靠 `tenants` 陣列控存取                |
| `tenants`         | tenant 本身                                  |
| `sessions`        | 以 userId 直接 query                          |
| `login-attempts`  | 跨 tenant 觀察暴力破解                        |

新增請更新 `src/global-collections.ts` 並在 PR 註明理由。

## 指令

```bash
pnpm typecheck
pnpm lint
pnpm test
```
