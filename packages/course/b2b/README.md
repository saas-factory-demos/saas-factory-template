# @saas-factory/course-b2b

企業包班：席次管理 + CSV 匯入 + SSO（Google Workspace / Microsoft Entra / SAML 2.0）+ JIT provisioning + HR 報表。

## 功能

- **席次管理**：`seatsTotal` / `seatsUsed`，學員離職釋出
- **CSV 匯入**：email 格式 + 公司網域 + 席次 + 去重檢查
- **SSO JIT provisioning**：SSO 登入回來自動建 learner，並重新啟用 inactive 帳號
- **HR 報表**：按部門統計完成課程數、平均完成率（progress 由外部模組注入）
- **autoEnrollCourses**：新員工自動 enroll 課程（由外部 enrollment 模組依 `listLearnerUserIds()` 批次處理）

## SSO 三種

| Provider | 設定欄位 |
|---|---|
| Google Workspace | `hostedDomain` / `clientId` / `clientSecret` |
| Microsoft Entra ID | `tenantId` / `clientId` / `clientSecret` |
| SAML 2.0 | `entityId` / `idpSsoUrl` / `idpCertPem` + 屬性對應 |

本 package 不負責執行 OIDC / SAML handshake，只保存設定 + 提供 `resolveSsoLogin(claims)` 處理 SSO callback 回來後的帳號路由與建檔。

## 使用

```ts
import { B2BService, InMemoryB2BStore } from '@saas-factory/course-b2b';

const svc = new B2BService(new InMemoryB2BStore());

// CSV 匯入
const result = await svc.importLearnersFromCsv({
  tenantId, b2bAccountId, rows: [{ email: 'a@tsmc.com', department: 'RD' }],
});

// SSO 回來
const { learner, account } = await svc.resolveSsoLogin(tenantId, {
  email: 'newbie@tsmc.com', name: 'Newbie', department: 'RD',
});
```
