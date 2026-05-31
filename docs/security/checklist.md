# SaaS Factory 安全 Checklist 自查紀錄

> 對應 goal-99.4。每次大版發布前重跑一遍，新欄目按時間加在末尾。

## 自查日期：2026-05-16

| # | 項目 | 狀態 | 證據 / 位置 | 待辦 |
|---|---|---|---|---|
| 1 | 所有 form 都有 CSRF 防護 | ✅ | Payload 內建 csrf，next/server actions 走 same-origin。lp/checkout-form `service.ts` OTP 流程靠 token 而非 cookie，不需 CSRF | — |
| 2 | 所有 input 都用 Zod 驗證 | ✅ | `packages/factory/wizard/src/schemas.ts`、`packages/payment/*/src/*.ts`、`packages/lp/checkout-form/src/service.ts` 全 schema 驗證 | — |
| 3 | SQL injection 風險 | ✅ | 全部走 Payload（drizzle），無 raw SQL；audit-log / analytics 也用 collection API | — |
| 4 | XSS 風險（rich text sanitize） | ✅ | `packages/lp/blocks/src/sanitize.ts` + `validator.ts` 過濾 script tag、on*-handler、javascript:/vbscript:/data: URI；custom-html block 預設 sanitized，`allowScripts=true` 才放行 | — |
| 5 | 機密都用 env var | ✅ | grep `process.env` 確認；factory `auth.ts` 拒絕短於 16 字 token | — |
| 6 | HTTPS 強制 | ✅ | Vercel 預設；客戶自架文件要求 Caddy / Nginx 設 HSTS | — |
| 7 | CSP header 設定 | ✅ | `apps/template/middleware.ts` 預設 Report-Only + analytics allowlist；`/api/security/csp-report` 收違規；觀察 7 天後設 `CSP_ENFORCE=true` 切強制 | — |
| 8 | Rate limiting（登入 / 註冊 / OTP / API） | ✅ | `apps/factory/lib/rate-limit.ts`（factory 端 4 條 route）、`packages/lp/checkout-form/src/service.ts`（OTP short/long window）、`packages/lp/cod-handling/src/service.ts`（velocity max-orders） | — |
| 9 | 2FA 後台運作 | ✅ | `packages/core/auth/two-factor.ts` + UsersCollection 2FA 欄位完備；`docs/customer/delivery-sop.md` Day 4-6 內部測試與 Day 6-10 客戶測試流程強制 owner / admin 啟用 TOTP（7 天緩衝） | — |
| 10 | OWASP Top 10 sweep | ✅ | 見下方分項表 | — |
| 11 | Webhook 簽章驗證 | ✅ | newebpay / ecpay / linepay / stripe 各自 signature module，全部 timingSafeEqual | — |
| 12 | HMAC bootstrap-admin | ✅ | `packages/factory/hmac` + `apps/factory/lib/admin-bootstrapper.ts` 簽 timestamp+method+path+body，skew 5min | — |
| 13 | 暴力破解防護（登入） | ✅ | `apps/template/payload.config.ts` users.auth 已設 `maxLoginAttempts=5, lockTime=600_000`，sameSite=Strict | — |
| 14 | OTP 暴力破解防護 | ✅ | `OTP_RATE_LIMIT_DEFAULTS` short 10min/3、long 60min/6 | — |
| 15 | 訂單 velocity 防刷 | ✅ | `BlacklistPolicy.velocityMaxOrders=3 / 60min` | — |
| 16 | Countdown token 偽造 | ✅ | HMAC-SHA256 signed + timingSafeEqual + 每訪客 deterministic 過期 | — |
| 17 | Module slug 注入 | ✅ | `wizard schemas.moduleSelectionSchema` 用 `MODULE_SLUGS` 白名單列舉，不接 string | — |
| 18 | 註解注入（template-writer） | ✅ | `sanitizeComment` 過濾 \*/、控制字元；結構欄位走 JSON.stringify | — |
| 19 | 並發 race（subdomain） | ✅ | `FactoryGenerator.start()` 檢查 ProjectStore.findBySubdomain + 進行中 generation 同 subdomain | — |
| 20 | secrets in git | ✅ | `.env*` 在 .gitignore；CI 用 secrets context；無 hardcode token | — |
| 21 | Factory Support 通道稽核（ADR-0100） | ✅ | `apps/template/collections/factory-support-logs.ts` create/update/delete 全禁；HMAC route 走 overrideAccess 寫入；月報自動帶「本月維修存取 X 次」一欄；ToS template 第 4.6 條揭露 | — |
| 22 | Factory Support 通道密鑰隔離 | ✅ | `FACTORY_SUPPORT_SECRET` 與 `FACTORY_BOOTSTRAP_SECRET` 分離；前者季度 rotate，後者長期不動；fail-closed（未設則整條 endpoint 關 / generator step noop） | — |
| 23 | Factory Support 帳號禁刪 | ✅ | `apps/template/payload.config.ts` users.access.delete 過濾 `role != factory-support`；客戶端 owner / admin 都無法從 UI 誤刪 | — |
| 24 | Factory Support 帳號可凍結 | ✅ | `factoryAccessDisabledAt` 欄位 + beforeLogin hook 阻擋登入；客戶可隨時請求 disable | — |

---

## OWASP Top 10 對照

| OWASP 2021 | 對策 |
|---|---|
| A01 Broken Access Control | Payload 內建 role-based access control，client / customer / admin 三層 |
| A02 Cryptographic Failures | bcrypt（Payload 預設 pw hash）+ HMAC-SHA256（webhook + bootstrap）+ AES-256（R2 SSE）|
| A03 Injection | Zod 全 input 驗證 + Payload ORM（無 raw SQL）+ sanitize HTML |
| A04 Insecure Design | Rate limit + velocity 限制 + COD blacklist + OTP throttle |
| A05 Security Misconfiguration | `.env.production.example` 列必填、Factory `requireFactoryAuth` 短 token 拒絕 |
| A06 Vulnerable Components | `security-scan.yml` 每日跑 pnpm audit + osv-scanner，高風險自動開 issue |
| A07 Identification & Auth Failures | Payload maxLoginAttempts（**待打開**）+ OTP rate limit + 2FA TOTP 可選 |
| A08 Software & Data Integrity | HMAC bootstrap、webhook 簽章、SRI for CDN（待加，列 TODO） |
| A09 Logging & Monitoring | Sentry self-hosted（goal-99.6）+ Payload audit-log collection + `factory-support-logs`（ADR-0100 維修通道稽核）|
| A10 SSRF | webhook URL 用 allowlist；Factory `rate-limit.ts` 防 webhook replay |

---

## 待辦（追蹤到 issue）

v1.0 列的 4 項已在 v1.1 hardening 完成：

- [x] **99.4-CSP-1**（v1.1）：`apps/template/middleware.ts` Report-Only CSP + `/api/security/csp-report`
- [x] **99.4-2FA-1**（v1.1）：`docs/customer/delivery-sop.md` Day 4-6 / Day 6-10 強制啟用 TOTP；UsersCollection 已具 totp 欄位
- [x] **99.4-LOGIN-1**（v1.1）：`apps/template/payload.config.ts` `maxLoginAttempts=5, lockTime=600_000, sameSite=Strict`
- [x] **99.4-SRI-1**（v1.1）：`apps/template/lib/security/sri.ts` + `apps/template/components/security/sri-script.tsx`；delivery-sop 加引入規範

v1.2 後續：

- [ ] **99.4-CSP-2**：將 script-src 從 `'unsafe-inline' 'unsafe-eval'` 升級為 `'strict-dynamic'` + nonce（需把 third-party script 改為 next/script + 注入 nonce）
- [ ] **99.4-2FA-2**：在 Payload login 路徑加 server-side 強制檢查（owner / admin 註冊滿 7 天且 `totpEnabled=false` → 鎖帳）

v1.5（goal-11 / ADR-0100 後續）：

- [ ] **11-AUDIT-1**：客戶端後台加「Factory Support 存取狀態」chip，即時顯示 provisioned / disabled / 本月次數
- [ ] **11-AUDIT-2**：factory app 後台 `/projects/[id]/support-access` 加 UI（4 個按鈕 + audit log 表）
- [ ] **11-AUDIT-3**：季度 cron 自動跑 `rotate-password`，避免人為遺忘
- [ ] **11-AUDIT-4**：factory-support 登入觸發 `action: 'login'` audit log（Payload `afterLogin` hook）

---

## 自查週期

- **每季**：重跑全表
- **每次 template tag 發版前**：重跑 OWASP 對照
- **發現 P0 弱點**：當天修 + hotfix tag
