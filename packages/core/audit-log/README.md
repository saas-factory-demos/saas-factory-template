# @saas-factory/audit-log

Append-only 操作審計紀錄。

## 用途

任何後台敏感操作（退款、跨 tenant、權限變更、密碼重設）一律寫入 `audit-logs` collection，符合稽核 / 個資法 / 客戶交付要求。

## 使用

### 1. 在 Payload config 註冊 collection

```typescript
import { AuditLogsCollection } from '@saas-factory/audit-log';

export default buildConfig({
  collections: [AuditLogsCollection /* ... */],
});
```

### 2. 業務模組依賴 `AuditRecorder` 介面

```typescript
import { PayloadAuditRecorder } from '@saas-factory/audit-log';

const recorder = new PayloadAuditRecorder(payload);

await recorder.record({
  userId: req.user.id,
  tenantId: req.user.currentTenantId,
  action: 'order.refund',
  resourceType: 'Order',
  resourceId: orderId,
  before: { status: 'completed', refunded: 0 },
  after: { status: 'refunded', refunded: 1000 },
  metadata: { reason: '客戶要求' },
  ip: req.ip,
  userAgent: req.headers['user-agent'],
});
```

## 規則

- collection access：`update` / `delete` 一律 false（append-only）
- `read` 只給 owner / admin
- 寫入前自動 redact 敏感欄位（password、apiToken、secret 等）
- 跨 tenant 操作必須帶 `crossTenant: true`

## 指令

```bash
pnpm typecheck
pnpm lint
pnpm test
```
