# 客戶維護 SOP

> 保固期 13 個月內、保固期後維護期通用。配合「全程 alias email + factory owner 操作」模式。

---

## 一、例行檢查週期

### 每日（自動 + 5 分鐘人工）
- 自動：Sentry 收 error 即時推 LINE
- 自動：Uptime 監控 5 分鐘 ping 一次，down → LINE
- 人工：早上開健康度 Dashboard 掃所有客戶站，異常者深挖

### 每週
- 查每個客戶站訂單量趨勢（突降 > 50% 主動聯絡客戶）
- 查 Email / LINE / SMS 投遞失敗率（> 5% 提工單）
- 查 Sentry 是否有「未解決 > 3 天」issue → 排修

### 每月
- 寄月度健康度報告給客戶（自動產生 PDF）
- 跑一次資料庫 size + slow query 體檢
- 跑一次依賴弱點掃描（除自動排程外人工複查）

### 每季
- DR 演練（依 `infra/sentry-self-hosted/README.md` 第九節）
- 全 OWASP Top 10 重跑（依 `docs/security/checklist.md`）
- 客戶滿意度回訪

---

## 二、升級流程（template 新版發布時）

當工廠 push `v1.x.x` tag：

1. `template-tag.yml` workflow 自動建 GitHub Release + 通知 issue
2. 評估本次升級影響範圍：
   - patch（修 bug）：直接全客戶站升級
   - minor（加功能）：先升 1-2 個客戶站測 1 週，沒問題再全升
   - major（breaking change）：個別評估，逐站手動升
3. 升級單一客戶站：
   ```bash
   cd <client-repo>
   pnpm dlx @saas-factory/upgrade v1.x.x
   pnpm typecheck && pnpm lint && pnpm test
   git commit -am "chore: 升級至 template v1.x.x"
   git push  # 自動觸發 preview-deploy 跑 E2E
   # 確認 staging 沒問題 → merge to main → production deploy
   ```
4. 升級後 24 小時內密集看 Sentry，有異常立即 rollback

---

## 三、客戶問題處理流程

### 接收管道
- GitHub Issues with label `client:<subdomain>`
- Alias Email（客戶寄到 `<brand>@<your-domain>` 自動轉發）
- 緊急 LINE 群組（限金流壞 / 網站當）

### 分級
| 級別 | 定義 | SLA |
|---|---|---|
| P0 | 網站完全不可訪問 / 金流不能收款 / 訂單資料外洩 | 1 小時內回應、4 小時內修復 |
| P1 | 核心功能壞（結帳、登入、後台主流程） | 4 小時內回應、24 小時內修復 |
| P2 | 邊緣功能壞（特定模組、舊瀏覽器） | 1 工作天內回應、3 工作天內修復 |
| P3 | 改善 / 加分項 | 收齊一波做（每月一次） |

### 修復步驟
1. 在 Sentry / health dashboard 找到對應 event / metric
2. local reproduce（用 client 提供的步驟）
3. 寫 hotfix branch → PR → preview deploy → E2E
4. merge to main → 自動 production deploy
5. 在 issue 留紀錄：根因 / 修復 commit / 後續預防措施
6. 重大 incident（P0 / P1）跑 postmortem 寫到 `docs/runbooks/postmortems/`

---

## 四、緊急狀況處理 runbook

### 4.1 網站完全當機
1. 看 BetterStack 確認真的當（非單點 ISP 問題）
2. 看 Vercel deployment 是否最新版正常
3. 看 Sentry 是否有大量 5xx → 看 stack trace
4. 不確定根因 → rollback 到上一個 deployment
5. LINE 通知客戶「已 rollback，正在排查」
6. 排查完寫 postmortem

### 4.2 金流壞了
1. 確認是哪一家金流（看 Sentry tag）
2. 看 webhook 是否收到（看 audit-log）
3. 確認 webhook 簽章驗證有沒有壞（看 webhook log）
4. 確認金流商側狀態頁（藍新 / 綠界 / Stripe 都有公開狀態頁）
5. 若是金流商當機 → LINE 通知客戶「外部服務暫停，已備案手動匯款」
6. 若是我方 bug → hotfix；同時把卡住的 webhook 在後台手動補單

### 4.3 資料庫滿了 / 慢查詢
1. `pg_stat_activity` 找慢 query
2. 若是 missing index → 加 index migration
3. 若是 N+1 → optimize Payload populate
4. 若 disk 滿了 → vacuum / 升級 plan

### 4.4 Sentry 自架機器當機
1. SSH 進 Oracle A1
2. `docker compose ps` 看哪個容器掛
3. `docker compose logs <service>` 看錯誤
4. 一鍵重啟：`docker compose restart`
5. 不行就 `git checkout <last-known-good> && docker compose up -d`
6. 同時改 fallback：所有客戶站 Sentry DSN 暫時改 `sentry.io` SaaS 免費版

---

## 五、收費規則

### 保固期內（前 13 個月）
- 所有 P0 / P1 / P2 免費修
- P3 一個月內排一次免費修
- 新功能不在保固範圍（另報）

### 保固期過後（第 14 個月起）
| 維護等級 | 月費（建議） | 包含 |
|---|---|---|
| 基本 | NT$3,000 | 監控 + P0 / P1 修復 + 每月升級 |
| 標準 | NT$6,000 | + P2 / P3 修復 + 每季 review meeting |
| 完整 | NT$12,000 | + 客製功能 4 小時 / 月額度 + 24/7 LINE 支援 |

不續維護的客戶：
- 移除 Sentry DSN（不再幫他監控）
- 從健康度 Dashboard 移除
- alias email 保留 6 個月以接收殘餘信件
- 保留 90 天可恢復視窗，之後永久刪除帳號（依資料保留政策）

---

## 六、輪值表

目前單人營運（我），未來擴編時填這張表：

| 時段 | 主責人 | 備援 |
|---|---|---|
| 平日 09-18 | — | — |
| 平日 18-09 | — | — |
| 週末 / 假日 | — | — |

緊急 escalation：客戶 LINE → 主責人 → 30 分內沒回 → 備援接手
