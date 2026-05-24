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

## 環境變數

複製 `.env.local.example` 為 `.env.local` 後依需要調整。
