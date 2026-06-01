# @saas-factory/template

主程式範本（單一專案一個實例）。Next.js 15 App Router + Payload CMS 3。

## 開發

```bash
# 啟動 PostgreSQL（從 repo 根目錄）
docker compose up -d

# 安裝（從 repo 根目錄）
pnpm install

# 啟動 dev server
pnpm --filter @saas-factory/template dev
```

## 端點

| 路徑 | 用途 |
| --- | --- |
| `/` | CMS 首頁佔位 |
| `/products` | 電商商品列表佔位 |
| `/courses` | 課程列表佔位 |
| `/blog` | 部落格佔位 |
| `/{slug}` | LP 動態路由佔位（例：`/test-lp`） |
| `/admin` | Payload 後台 |
| `/api/health` | 健康檢查 |
| `/api/*` | Payload REST API |
| `/api/graphql` | Payload GraphQL |
| `/api/cron/workflow-tick` | Workflow scheduler tick（cron 入口，Bearer `CRON_SECRET`） |
| `/api/workflows/[id]/trigger` | 觸發 workflow run（SF-HMAC `WORKFLOW_RUNTIME_SECRET`） |

## Workflow runtime

本 app 內建 workflow scheduler / dispatcher（pkg：`@saas-factory/factory-workflow-runtime`）。

- Workflow 定義來源：Payload `workflow-registry` collection（factory 端 HMAC push 或 stage 3 後台 CRUD 寫入）
- Run state 持久化：`template_workflow_runs` table（runtime 第一次跑會 idempotent CREATE TABLE IF NOT EXISTS）
- 喚醒 suspended runs：靠 cron 打 `/api/cron/workflow-tick`

Vercel Hobby 不支援 cron。建議走以下任一：

1. **GitHub Actions schedule**（免費、5 分鐘最短）：repo 加 `.github/workflows/workflow-tick.yml`，curl 打 cron 端點帶 Bearer
2. **cron-job.org** / **EasyCron**：免費外部 cron 服務
3. **Upstash QStash**：scheduled message 打 webhook

需要的 env：

| 變數 | 用途 |
| --- | --- |
| `CRON_SECRET` | `/api/cron/workflow-tick` Bearer 鑑權（fail-closed 未設則 503） |
| `WORKFLOW_RUNTIME_SECRET` | trigger / registry push 的 SF-HMAC 共用 secret |
| `RESEND_API_KEY` | send-email / notify-admin 動作走 Resend，未設則 stub ok |
| `WORKFLOW_NOTIFY_FROM` | 寄信 From（預設 onboarding@resend.dev） |
| `WORKFLOW_ADMIN_EMAIL` | notify-admin 動作目的地 |

## Factory Support 通道（ADR-0100）

本範本內建 SaaS Factory 維修通道：每個出貨客戶站於 generation 時自動建立一個
`factory-support` 角色帳號，供工廠端日後維護使用。詳見 `docs/decisions/0100-factory-support-access.md`。

### 端點

| 路徑 | Method | 用途 |
| --- | --- | --- |
| `/api/factory/support-access/provision` | POST | 建立 factory-support 帳號（idempotent） |
| `/api/factory/support-access/rotate-password` | POST | 重設密碼 |
| `/api/factory/support-access/disable` | POST | 凍結（客戶端請求） |
| `/api/factory/support-access/enable` | POST | 解除凍結 |
| `/api/factory/support-access/status` | POST | 查狀態（provisioned / disabled / lastLoginAt / monthlyAccessCount） |
| `/api/factory/support-access/audit-log` | POST | 查近期 audit log（分頁 + filterAction） |

所有端點走 **HMAC**（與 `bootstrap-admin` 同模式），未設 `FACTORY_SUPPORT_SECRET` 時 fail-closed 回 403。

### 安全特性

- `users.role` 多一個 `factory-support` 選項，預設不可由 admin UI 建立 / 改 / 刪除
- `users.factoryAccessDisabledAt` 設值後該帳號 `beforeLogin` 拒絕登入
- `beforeChange` hook 阻擋 admin UI 任何寫入 `role=factory-support` / `isFactoryManaged=true` 操作
- HMAC route 走 `req.context['support-access-override']=true` 繞過上述 hook
- `factory-support-logs` collection：create/update/delete 全禁，只能 HMAC route overrideAccess 寫入
- factory-support 帳號**不受** 99.4-2FA-2 7 天 TOTP 強制（密碼由 HMAC rotate 自管）
- 成功登入觸發 `afterLogin` hook，寫一筆 `action='login'` audit log

### 環境變數

| 變數 | 用途 |
| --- | --- |
| `FACTORY_SUPPORT_SECRET` | HMAC 共用密鑰（>= 32 字元，與 `FACTORY_BOOTSTRAP_SECRET` 分離 rotate） |

未設則所有 `/api/factory/support-access/*` 端點回 403；既有 factory-support 帳號仍可正常登入（不影響執行時期）。

## 99.4-CSP-2 strict-dynamic + nonce（Report-Only 觀察）

預設 CSP-1 模式（`'unsafe-inline' 'unsafe-eval'`）；設 `CSP_STRICT_DYNAMIC_REPORT_ONLY=true` 啟用：

- middleware 產 per-request nonce，透過 `x-csp-nonce` request header 傳給 Server Components
- CSP `Content-Security-Policy-Report-Only` 走 `'strict-dynamic' 'nonce-XXX' 'unsafe-inline'`（舊瀏覽器 fallback）
- 觀察 `/api/security/csp-report` 違規 1-2 週，全部 fix 後再切 `CSP_ENFORCE=true` 強制模式

詳見 `lib/security/csp-nonce.ts`。

## 環境變數

複製 `.env.local.example` 為 `.env.local` 後依需要調整。
