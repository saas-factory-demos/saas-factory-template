# 客戶交付 SOP

> 從接案到交付完整 SOP。配合「B 買斷 + 13 個月保固 + 自家網域 alias email」模式。

---

## 0. 接案前置（簽約前）

- [ ] 客戶基本資料：公司 / 品牌名、聯絡人、Email、電話、統編
- [ ] 確認交付模型（買斷 vs 訂閱 vs 託管）
- [ ] 報價單與付款條件
- [ ] 客戶交付合約簽核（範本：`docs/customer/contract-template.md`）

---

## 1. 客戶資料蒐集（Day 0-3）

收件對象：合約簽完後 1 個工作天內發送。

寄出工具：用 SaaS Factory 客戶資料蒐集表（Notion / Tally）。

蒐集項目：

### 1.1 識別資料
- 客戶名稱（zh / en）
- 品牌名（zh / en）
- subdomain（建議格式 `<brand>-shop`）
- 自訂 domain（如要切到客戶網域）

### 1.2 視覺品牌
- Logo（SVG 優先）+ favicon
- 主色 / 輔色（HEX）
- 字體偏好（sans / serif / display / mixed）
- 圓角偏好（sharp / subtle / soft / extra-soft）
- 視覺密度（compact / normal / spacious）

### 1.3 模組與站別
- 站別：showcase / lp / shop / course / blog（多選）
- 模組勾選（依站別自動帶預設，可加減）

### 1.4 金流物流發票通知
- 金流：藍新 / 綠界 / LinePay / 街口 / TapPay / Stripe / PayPal
- 物流：黑貓 / 7-11 / 全家 / 新竹 / 萊爾富 / 郵局 / 國際
- 發票：ezpay / 綠界發票；模式：即時 / 觸發 / 排程
- 通知：Email / LINE / SMS / Web Push

### 1.5 多語系
- 預設語系（zh-TW）
- 啟用語系（多選）
- 是否多幣別 / 多時區

### 1.6 部署
- 目標：Vercel（首選）/ Zeabur / 客戶自架 Docker
- repo name
- staging + production 環境（首發建議都開）

---

## 2. Factory 生成（Day 3）

```bash
# 工廠後台 /new
1. 8 步驟 Wizard 全填完
2. 送出 → 自動觸發 generator（10 步驟）
3. 觀察進度頁，全綠 → 進入下一步
```

- [ ] GitHub repo 已建立
- [ ] Vercel project 已建立
- [ ] staging deployment 跑通
- [ ] `.env.production.example` 已產出
- [ ] 客戶 admin 帳密已寄到工廠 owner 信箱

---

## 3. 你填 env（Day 3-4）

從 `.env.production.example` 對照客戶蒐集表，填入：

- 金流 merchant id / hash key / hash IV
- 發票 merchant id / hash key / hash IV
- 通知 token（Resend / LINE / Mitake）
- DATABASE_URL（用 Neon / Supabase / Zeabur Postgres）
- PAYLOAD_SECRET（用 `openssl rand -base64 48`）
- NEXT_PUBLIC_SITE_URL
- Sentry DSN（factory 建好的 project）

填完推 `production` env 到 Vercel，跑一次 deploy 確認。

---

## 4. 內部測試（Day 4-6）

對照 `docs/customer/internal-test-checklist.md` 逐項：

- [ ] 後台登入（admin email + factory 產生密碼）
- [ ] **首次登入後 24 小時內為 owner / admin 帳號啟用 TOTP 2FA**（依 ADR-0010 §8）
  - 用 Authenticator app 掃 QR → 確認 6 位數碼 → 抄錄 10 組 recovery codes 入密管
  - 客戶之後新增的後台帳號交付 SOP：見第 5 節「客戶測試」步驟
- [ ] 驗證 `maxLoginAttempts=5, lockTime=600000` 生效：故意打 5 次錯密碼，第 6 次應鎖 10 分
- [ ] 商品 / 課程 / LP / 文章可新增
- [ ] 前台首頁顯示正確（主色、Logo、文案）
- [ ] 結帳跑通（先用金流測試模式）
- [ ] 發票觸發成功
- [ ] Email 通知收到
- [ ] LINE / SMS 通知收到
- [ ] 行銷自動化跑通（棄單回收 / 完課發證）
- [ ] 多語系切換正常
- [ ] Lighthouse ≥ 90（首頁）
- [ ] Sentry 收得到測試錯誤
- [ ] 健康度 Dashboard 顯示綠燈
- [ ] CSP Report-Only 觀察 7 天無誤報後切 `CSP_ENFORCE=true`（見 `apps/template/middleware.ts`）

---

## 5. 客戶測試（Day 6-10）

寄信給客戶：

```
主旨：[品牌] 網站第一版完成，請進行 UAT 測試
內容：
  - admin URL：https://<sub>.<domain>/admin
  - admin email：<contactEmail>
  - admin password：（首次登入請改）
  - 2FA 啟用步驟：登入後右上角頭像 →「啟用 2FA」掃 QR → 抄下 recovery codes
    （owner / admin 角色 7 天內未啟用會被強制鎖帳，見 ADR-0010 §8）
  - 測試指引：docs/customer/uat-checklist.md
  - 回報方式：每筆 issue 開到 GitHub Issues / Notion 看板
  - 測試期限：7 天
```

期間：

- 每日彙整 issue，按優先級（P0 阻擋 / P1 重要 / P2 改善 / P3 加分）排
- P0 / P1 當天 / 隔天修
- P2 / P3 收齊一波修

---

## 6. 上線前最後檢查（Day 10）

- [ ] 金流切換為正式模式（拿掉測試 merchant）
- [ ] Sentry source map 上傳成功
- [ ] Uptime monitor 已建立（BetterStack）
- [ ] `robots.txt` 已開放（前期 staging 是 disallow all）
- [ ] sitemap.xml 可訪問
- [ ] OG image / favicon 顯示正確
- [ ] Google Search Console / Analytics 已驗證
- [ ] GA4 / Meta Pixel / Conversion API 接好
- [ ] DNS A record 預備（先放著、設低 TTL）
- [ ] 第三方 JS 引入規範：
  - 靜態 CDN 檔（指定版本的 jQuery / Alpine 等）→ 用 `<SriScript>`（見 `apps/template/components/security/sri-script.tsx`），integrity hash 用 `lib/security/sri.ts` 預先算
  - 服務型 SDK（GTM / Pixel / LINE Tag / TapPay 等）→ 用 `next/script` + 加入 CSP allowlist，不加 SRI（vendor 會熱更新）

---

## 7. Domain 切換上線（Day 11）

切換窗口：選平日早上 09:00-10:00（流量低 + 工時內出問題能救）。

- [ ] 把 `customDomain` 加到 Vercel project
- [ ] 客戶 DNS 切 A / CNAME 到 Vercel
- [ ] 等 SSL 簽發完成（< 1 小時）
- [ ] HTTPS 訪問驗證
- [ ] 設 301 redirect（如客戶有舊網域）
- [ ] Sentry 上 production tag
- [ ] 健康度 Dashboard 進入「已上線」狀態

---

## 8. 上線後 7 天保固（Day 11-18）

- 每日早 / 晚開一次 Sentry + 健康度 Dashboard
- 7 天內任何 P0 / P1 免費修
- 第 7 天請客戶簽收（Email + Notion 紀錄）

---

## 9. 移交維護階段（Day 19+）

進入 13 個月保固維護期：

- [ ] 加入 `docs/customer/maintenance-sop.md` 維護輪值表
- [ ] 客戶 email alias 設好（factory owner 全程操作客戶後台）
- [ ] **ADR-0100 雙軌維修通道交付揭露**：
  - [ ] 確認 generator install-support-access step 已成功（`outputs.supportAccess.email` 已寫入）
  - [ ] 將 `outputs.supportAccess.initialPassword` 收進 Bitwarden vault（路徑 `clients/<subdomain>/factory-support`），factory app DB 立即清空此欄
  - [ ] 客戶簽收前確認其書面同意 `docs/customer/tos-template.md`（特別是第 4 條技術支援存取條款）
  - [ ] 客戶 onboarding 簡報附「Factory Support 通道是什麼」單頁說明，告知：(1) 工廠每次存取會留 audit log；(2) 客戶後台可隨時查；(3) 月報會自動附上次數
- [ ] 月度健康度報告排程（每月 1 號自動寄，含「本月維修存取 X 次」一行）
- [ ] 13 個月後保固期到 → 客戶決定要不要續約維護費
  - 不續約 → factory-support 通道仍依 ADR-0100 保留，僅用於災難救援
  - 客戶徹底退場 → 走 ToS 第 6 條退場流程（30 天 transfer）

---

## 重要連絡點

- 內部 issue 看板：GitHub Issues with label `client:<subdomain>`
- 客戶回報窗口：客戶在 GitHub 開 issue OR 寄到 alias email
- 緊急（金流壞 / 網站當）：LINE 群組直 ping
