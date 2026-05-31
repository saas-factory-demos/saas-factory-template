# GitHub Secrets / Variables 佔位狀態

> 最後更新：2026-05-16
> 維護人：owner

---

## 狀態說明

下列 secret / variable 目前為**佔位值**（非真實憑證），用於補齊 workflow 引用避免 `missing secret` 錯誤，但**呼叫真實服務時必定失敗**（DNS 不存在、API key 拒收、信箱 RFC 2606 reserved）。

換言之：**這些 workflow / endpoint 跑了會壞，這是預期行為，不是 bug**。要實際運作必須把佔位值換成真實憑證。

---

## 佔位清單

| 名稱 | 類型 | 佔位值 | 真實來源 | 用到的地方 |
|---|---|---|---|---|
| `RESEND_API_KEY` | secret | `PLACEHOLDER_REPLACE_BEFORE_USE_resend_key` | https://resend.com/api-keys | `scripts/monthly-health-report.ts` |
| `REPORT_FROM` | secret | `placeholder@example.invalid` | 已驗證 Resend 寄件信箱 | 同上 |
| `REPORT_TO` | secret | `placeholder@example.invalid` | owner / partner 收件信箱 csv | 同上 |
| `FACTORY_URL` | secret | `https://placeholder.invalid` | factory 部署後的對外 URL（等 Vercel 首次部署完替換） | 同上 |
| `FACTORY_NOTICE_REPO` | variable | `ephraim719/PLACEHOLDER_REPO` | 客戶通知 repo | `.github/workflows/template-tag.yml` |

> `example.invalid` 與 `placeholder.invalid` 是 RFC 2606 / RFC 6761 保留網域，**永遠不會解析**，
> 確保誤觸時必定 DNS 失敗、不會誤打到真實系統。

## 真實 token（已就位）

| 名稱 | 來源 |
|---|---|
| `FACTORY_BEARER_TOKEN` | `openssl rand -hex 32` 隨機，內部 API 用。**Vercel 端對應 env 名稱叫 `FACTORY_ADMIN_TOKEN`**，兩處值相同（server 驗 admin、client 寄 bearer） |
| `FACTORY_NOTICE_TOKEN` | 同上，給 template-tag → 客戶 repo 通知用 |
| `VERCEL_TOKEN` | `vercel.com/account/tokens` → scope = personal team。Account scope 限定，不選 Full Access |
| `VERCEL_ORG_ID` | `team_fZl32U2FoJyZI4VIcgFnS1wj`（personal team ID，非 secret 但放 secret 統一管理） |
| `VERCEL_PROJECT_ID` | `prj_LxgBMvs80N2JeNt696Bag32lvOm6`（factory app 的 Vercel project ID） |

---

## 換真實值流程

```bash
# Resend
echo "<從 resend.com 拿的 api key>" | gh secret set RESEND_API_KEY -R ephraim719/saas-factory

# 寄件 / 收件
echo "ops@your-domain.com" | gh secret set REPORT_FROM -R ephraim719/saas-factory
echo "owner@your-domain.com,partner@your-domain.com" | gh secret set REPORT_TO -R ephraim719/saas-factory

# Factory URL（部署完才有）
echo "https://factory.your-domain.com" | gh secret set FACTORY_URL -R ephraim719/saas-factory

# Notice repo
gh variable set FACTORY_NOTICE_REPO -b "ephraim719/<your-clients-repo>" -R ephraim719/saas-factory
```

換完逐一刪除本檔對應列、commit `docs: 移除 X secret 佔位標記`。當所有列都刪光時刪整個檔。

---

## 影響的 workflow / endpoint 失敗預期

- `.github/workflows/preview-deploy.yml`：PR 開 → 已可正常部署到 Vercel（token / org / project 都真）
- `.github/workflows/monthly-health-report.yml`：每月 1 號 01:00 UTC cron → fetch `https://placeholder.invalid` DNS 失敗，整個 job fail，GitHub 自動寄通知給 owner（可當「該換真實 secret 了」的提醒鈴）
- `.github/workflows/template-tag.yml`：tag 觸發後通知 `ephraim719/PLACEHOLDER_REPO` 也會 404 fail

要暫時靜音可在 workflow 加 `if: vars.FACTORY_NOTICE_REPO != 'ephraim719/PLACEHOLDER_REPO'` 之類的 guard，但**不建議**——讓它響著更不會忘。
