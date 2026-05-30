# @saas-factory/factory-support-access

工廠端與客戶站之間的「**factory-support 維修通道**」HMAC client / verify helper。

對應 ADR-0100 / goal-11 雙軌維修存取設計：

- **L1 應用層**：客戶站 Payload Users collection 內保留一個 `factory-support` 服務帳號，
  由工廠端透過此套件 rotate 密碼、disable / enable、查 audit log。
- **稽核**：每次操作都會在客戶站 `factory-support-logs` collection 留紀錄，
  月報自動附「本月維修存取 X 次」一行。

## 安全模型

簽章基底與 `@saas-factory/factory-hmac` 一致（`METHOD\nPATH\nTIMESTAMP\nBODY`），
但用獨立 secret `FACTORY_SUPPORT_SECRET`（與 bootstrap-admin 分離，獨立 rotate / revoke）。
驗章採 `timingSafeEqual` + 5 分鐘時間漂移，未設 secret 時 fail-closed。

## 6 個 Action

| Action | 用途 | 客戶站端動作 |
|---|---|---|
| `provision` | 建立 factory-support 帳號（idempotent） | 新建 user 或回 `alreadyProvisioned=true` |
| `rotate-password` | 重設密碼 | 寫新密碼到 user.password + audit log |
| `disable` | 客戶請求停用通道 | 寫 `factoryAccessDisabledAt`，`beforeLogin` 開始拒絕 |
| `enable` | 解除停用 | 清空 `factoryAccessDisabledAt` |
| `status` | 查目前狀態 | 回 `{ provisioned, disabled, lastLoginAt, monthlyAccessCount }` |
| `audit-log` | 分頁查近期稽核紀錄 | 回 `{ entries, nextCursor, totalEstimate }` |

`provision` / `rotate-password` / `disable` / `enable` 為**寫操作**且寫進 audit log；
`status` / `audit-log` 為**讀操作**，不寫進 audit log（避免無限自我紀錄）。

## 使用

```ts
import { createSupportAccessClient } from '@saas-factory/factory-support-access';

const client = createSupportAccessClient(process.env.FACTORY_SUPPORT_SECRET!);

// 建立（第一次部署或 demo 站重建時）
const provisionRes = await client.provision({
  siteUrl: 'https://demo-shop.vercel.app',
  email: 'support+demo-shop@saas-factory.app',
  actorEmail: 'ops@your-domain.tw',
});
if (provisionRes.ok && !provisionRes.alreadyProvisioned) {
  console.log('初始密碼，請立刻收進 Bitwarden：', provisionRes.initialPassword);
}

// 季度 rotate
const { newPassword } = await client.rotatePassword({
  siteUrl: 'https://demo-shop.vercel.app',
  actorEmail: 'ops@your-domain.tw',
  reason: '季度排程 rotate',
});

// 客戶請求停用
await client.disable({
  siteUrl: 'https://demo-shop.vercel.app',
  actorEmail: 'ops@your-domain.tw',
  reason: '客戶 2026-XX-XX 寄信要求停用',
});

// 查當月存取次數（給月報 / dashboard）
const status = await client.status({
  siteUrl: 'https://demo-shop.vercel.app',
  actorEmail: 'ops@your-domain.tw',
});
if (status.ok) {
  console.log(`本月存取 ${status.monthlyAccessCount} 次，上次登入 ${status.lastLoginAt ?? '從未'}`);
}

// 分頁查 audit log
const page1 = await client.auditLog({
  siteUrl: 'https://demo-shop.vercel.app',
  actorEmail: 'ops@your-domain.tw',
  limit: 20,
  filterAction: 'rotate-password', // 可選
});
if (page1.ok && page1.nextCursor) {
  const page2 = await client.auditLog({
    siteUrl: 'https://demo-shop.vercel.app',
    actorEmail: 'ops@your-domain.tw',
    limit: 20,
    before: page1.nextCursor,
  });
}
```

## 錯誤型別

所有 method 都回 union `T | SupportAccessErrorResponse`：

```ts
type SupportAccessErrorResponse = {
  ok: false;
  reason:
    | 'config-missing'       // FACTORY_SUPPORT_SECRET 未設或太短
    | 'headers-missing'      // 客戶端少 timestamp / signature header
    | 'hmac-malformed'       // timestamp 非數字 / path 與 action 不符
    | 'hmac-expired'         // 時間漂移 > 5 分鐘
    | 'hmac-mismatch'        // 簽章不對（密鑰不對 / body 被改）
    | 'body-invalid'         // body 缺欄位或型別錯
    | 'forbidden'            // 預留
    | 'not-found'            // unknown action
    | 'create-failed'        // 客戶站 Payload create user 失敗
    | 'internal-error';      // 網路錯 / 非預期回應
  message: string;
};
```

Caller 應用 `if ('ok' in res && !res.ok)` narrow。

## 對應 template 端

客戶站需把 `verifyFactorySupportRequest`（在 `apps/template/lib/factory-support-verify.ts`）
套到 `/api/factory/support-access/[action]/route.ts`。預設 SaaS Factory 出貨的 template
已 wired。

## 對應 factory app 端

`apps/factory/lib/support-access-provisioner.ts` 提供 generator 用的 `SupportAccessProvisioner`
adapter；`apps/factory/app/api/projects/[id]/support-access/route.ts` 提供 REST 端點（GET 讀 / POST 寫）。

## 開發

```bash
pnpm --filter @saas-factory/factory-support-access typecheck
pnpm --filter @saas-factory/factory-support-access lint
pnpm --filter @saas-factory/factory-support-access test
```

## ADR 對齊

- ADR-0100：Factory Support Access 雙軌維修通道
- goal-11：本套件對應實作
