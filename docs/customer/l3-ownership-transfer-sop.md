# L3 平台層 Ownership Transfer SOP

> 對應 ADR-0100 第 4.4 條 + ToS 第 6 條退場流程。
> 適用情境：客戶徹底終止 SaaS Factory 服務，要求工廠端切斷所有 L3 平台存取。
> 文件版本：v1（2026-05-27）

---

## 觸發條件

只有在以下兩種情境啟動本流程，否則 factory 端依 ADR-0100 雙軌維修通道保留 L3 admin：

1. **客戶書面終止合約**：寄信至維護窗口明確聲明「終止 SaaS Factory 服務」
2. **客戶 ownership transfer 申請**：客戶提供新雲端帳號，請求接手

---

## 前置條件

- [ ] 客戶已書面同意接收 L3 ownership 後不再要求 factory 提供救援服務
- [ ] L1 `factory-support` 帳號已先走 `disable`（避免 transfer 期間 factory 仍在後台操作製造 audit 雜訊）
- [ ] 客戶提供以下對應平台的接手帳號：
  - GitHub username 或 org
  - Vercel team slug 或 personal account
  - Neon org id 或 personal account
  - Cloudflare account email + zone id（如有用 R2）

---

## 平台一：GitHub repository

### 機制

GitHub 原生 `Transfer ownership` 流程（settings → Danger Zone → Transfer ownership）。

### 步驟（factory 端執行）

1. 確認 repo 內所有 PR / Issue 都已關閉或重新指派給客戶端使用者
2. 進 repo settings → Danger Zone → **Transfer ownership**
3. 輸入新 owner 的 `username` 或 `org name`
4. 確認 `repo full name` 完整輸入後 submit
5. 客戶帳號會收到 GitHub 通知 email，需於 **7 天內接受**（過期 transfer 自動取消）
6. 客戶接受後：
   - factory token / PAT 失去寫入權限（不必手動 revoke，但建議去 [GitHub Settings → Tokens](https://github.com/settings/tokens) 把該 repo 的 PAT 範圍縮減或重簽）
   - GitHub Actions workflow 內的 `secrets` 自動失效（屬於 repo 層，跟著 transfer 走）

### 完成驗收

- [ ] `gh repo view <new-owner>/<repo>` 確認 owner 為新帳號
- [ ] factory 端 PAT 試打 `GET /repos/<old-owner>/<repo>` 回 404
- [ ] 客戶確認可以 push commit + 修改 settings

### 緩衝期

- GitHub transfer **沒有強制緩衝期**（接受即生效）；但客戶 24 小時內可請 GitHub support 要求 rollback
- factory 端建議在客戶接受後 30 天內保留 PAT，方便客戶若反悔可重新 invite

---

## 平台二：Vercel project

### 機制

Vercel `Transfer Project` 流程（project settings → General → Transfer Project）。

### 步驟

1. **先處理付費關聯**：若該 project 綁在 factory team 的 Pro plan 上，transfer 後要計入新接手 team 的 quota；客戶若是 Hobby plan，要先確認 project 不超過 Hobby 限制（不可 private repo / 不可 commercial use）
2. 進 project settings → General → **Transfer Project**
3. 選擇 target team（factory 端的 dropdown 只會列 factory token 有權的 team；如要轉到非 factory team，需先 invite factory 的 token 帳號到對方 team 為 member，transfer 後再退出）
4. 確認後 submit
5. Vercel 即時 transfer，**沒有客戶接受步驟**（因為已是 team-to-team 操作）
6. transfer 後：
   - 原 factory team 的 `VERCEL_TOKEN` 對該 project 失去存取
   - 環境變數跟著 project 走（不會洩漏，但客戶要自行管理 rotation）
   - GitHub 整合（auto-deploy）跟著走，但需確認 GitHub repo 也已 transfer

### 完成驗收

- [ ] `vercel ls --token=<factory-token>` 不再列出該 project
- [ ] 客戶用自己 token 跑 `vercel ls` 能看到
- [ ] 推一個小 commit 確認 auto-deploy 正常觸發

### 緩衝期

- Vercel 沒有 transfer rollback 機制；transfer 前務必三確認 target team

---

## 平台三：Neon Postgres project

### 機制

Neon `Project transfer` API（透過 console 或 API 把 project 移到不同 organization）。

### 步驟

1. 客戶提供：
   - Neon org id（在 Neon console → settings → general）
   - 客戶 org 內至少一位 admin 角色帳號
2. **先把客戶 admin 邀請到 factory org**（為了在 factory org 內可見 transfer 對象）
3. 進 Neon console → 該 project → settings → **Transfer project**
4. 選擇 target org（客戶 org）→ confirm
5. transfer **即時生效**（無客戶接受步驟）
6. 完成後：
   - 原 factory `NEON_API_KEY` 對該 project 失去存取
   - 連線字串不變（pool URL 與 region 跟著 project 走）
   - 但 client 應用程式仍用原 `DATABASE_URL` 環境變數連線，無須改動

### 完成驗收

- [ ] Neon console 確認 project 在客戶 org 名下
- [ ] factory API key 試打 `GET /projects/<id>` 回 403
- [ ] 客戶可進 console 查看 + 改設定

### 緩衝期

- Neon 即時轉移，沒有 rollback；transfer 前務必客戶書面確認

---

## 平台四：Cloudflare R2 bucket（如有）

### 機制

Cloudflare 無 bucket-level transfer，需走 **遷移流程**：客戶建新 bucket → factory 用 rclone 鏡像 → 客戶切 application 環境變數 → factory 刪舊 bucket。

### 步驟

1. 客戶於自家 Cloudflare account 建新 R2 bucket（命名建議 `<old-bucket-name>-migrated`）
2. 客戶生成新 access key（Read + Write）
3. factory 用 rclone 配兩端 remote 後跑同步：
   ```bash
   # /etc/rclone.conf 設兩個 remote：r2-old / r2-new
   rclone sync r2-old:<old-bucket> r2-new:<new-bucket> \
     --progress --transfers=8 --checkers=16
   ```
4. 同步完成後：
   - 客戶把應用程式 `R2_ACCESS_KEY` / `R2_SECRET_KEY` / `R2_BUCKET` env 切到新值
   - 觀察 1 週確認讀寫正常
5. factory 從自家 Cloudflare account 刪舊 bucket + 撤銷舊 access key

### 完成驗收

- [ ] 新 bucket 物件數 = 舊 bucket 物件數
- [ ] 應用程式上傳 / 下載新檔案正常
- [ ] 舊 bucket 刪除後應用程式無 404 / 403 報錯

### 緩衝期

- 7-30 天並行讀寫（依客戶資料量決定）
- 切換完成後 factory 再保留舊 bucket 7 天（供客戶反悔），之後刪除

---

## 平台五：Sentry self-hosted project（如有）

### 機制

Sentry self-hosted 不支援 transfer（factory 跟客戶的 Sentry 是物理隔離的 instance）；
等同「停用客戶站的 Sentry 監控」。

### 步驟

1. 客戶 application 端移除 `NEXT_PUBLIC_SENTRY_DSN` env 或設為空
2. factory 端進 Oracle A1 Sentry console → project → settings → **Disable project**（不刪除，保留歷史 events 供客戶日後 export）
3. 30 天後 factory 永久刪除 project + events

### 完成驗收

- [ ] 客戶站不再產生新的 Sentry events（factory console 確認）

---

## 平台六：Bunny.net 影片儲存（如有）

### 機制

Bunny stream 支援 library transfer，但複雜度高，建議走遷移流程（與 R2 同邏輯）。

### 步驟

1. 客戶於自家 Bunny.net account 建新 stream library
2. factory 用 Bunny API 批次 download → 客戶 upload（或用 Bunny native migrate tool）
3. 應用程式切 `BUNNY_STREAM_LIBRARY_ID` env
4. factory 刪舊 library

---

## 整體時程預估

| 平台 | 客戶提供帳號到完成 transfer | 緩衝期 |
|---|---|---|
| GitHub | 1 個工作日 | 7-30 天 |
| Vercel | 即時 | 不可 rollback |
| Neon | 即時 | 不可 rollback |
| Cloudflare R2 | 7-14 個工作日（含 rclone 同步） | 14 天 |
| Sentry | 1 個工作日 | 30 天保留 events |
| Bunny.net | 7-14 個工作日 | 14 天 |

**保守估計：30 天完成完整 L3 切斷**（符合 ToS 第 6 條承諾）。

---

## 退場稽核

完成所有 transfer 後：

- [ ] factory 內部跑一次驗證腳本：
      ```bash
      tsx scripts/audit-platform-access.ts <subdomain> \
        --repo=<old-owner>/<repo> \
        --vercel-project-id=<prj_xxx> \
        --neon-project-id=<np_xxx> \
        --r2-bucket=<bucket> \
        --sentry-project-slug=<slug> \
        --bunny-library-id=<libId>
      ```
      所有平台都應回 4xx/5xx；任一回 200 表示 transfer 未完成（exit 1）
- [ ] 客戶站 `factory-support-logs` collection 最後 30 天無工廠端登入紀錄
- [ ] 客戶簽署「移交完成確認單」（合約附件 B）
- [ ] factory 端 Bitwarden 對應條目歸檔（不刪除，標記 archived for 90 天後永刪）
- [ ] 月度健康度報告腳本從 `REPORT_TO` 移除該客戶（如有）

---

## 注意事項

1. **不要先轉 Vercel 才轉 GitHub**：Vercel 透過 GitHub 整合做 auto-deploy，若 Vercel 已轉但 GitHub 還在 factory，新 owner 的 push 不會觸發部署
2. **客戶到位前不要先 disable L1**：L1 disable 但 L3 還在 factory 手上時，若客戶 onboarding 出 bug 仍需 factory 救援
3. **transfer 期間關閉所有 cron**：先停 `quarterly-support-rotate` workflow，避免 transfer 中途 token 失效造成 alarm
4. **GDPR 客戶特別處理**：歐盟客戶 transfer 後 factory 不可保留任何客戶資料副本（含 Sentry events），即使是備份；30 天保留期改為 7 天硬刪
