# 部署與客戶交付流程

從接案到客戶上線的完整 SOP。

## 部署架構

```
你 (接案者)
  ↓
SaaS Factory（你的主 repo + Factory App）
  ↓
[生成階段]
  ├─ 建立 GitHub Repo（客戶專案）
  ├─ 寫入 project.config.ts
  ├─ Vercel / Zeabur 部署
  └─ Payload 初始化
  ↓
客戶站運作
  ├─ Vercel / Zeabur（前端 + API + Payload Admin）
  ├─ Neon / Supabase / Zeabur Postgres（資料庫）
  ├─ Cloudflare R2（媒體檔案）
  ├─ Bunny.net（影片串流，課程平台用）
  ├─ Resend（Email 寄送）
  └─ Sentry（錯誤監控）
```

## 部署目標比較

### Vercel（推薦首選）

- 全球 Edge Network 速度快
- Next.js 原生支援最完整
- Preview deployment 完整
- 價格透明
- 缺點：流量大成本高（適合中小客戶）

**月成本估計：**
- Hobby（免費）：個人專案 / 開發
- Pro（$20/月）：大多數客戶足夠
- Enterprise：流量大客戶

### Zeabur（台灣 CP 選擇）

- 台灣團隊、台灣機房（速度好）
- 價格便宜
- 支援 Payload + Postgres 一起部署
- 缺點：生態還在發展

**月成本估計：**
- Developer ($5/月)：小客戶
- Team ($20/月)：中型客戶

### Docker 自架

- 客戶要求資料自己掌控
- 完全控制
- 缺點：要你維護伺服器

**月成本：**
- VPS（Linode / Vultr / DigitalOcean）：$10-40/月

## 客戶交付完整 SOP

### Phase 1：接案

1. 客戶來談需求
2. 用 Factory App 跑「需求釐清」（勾選給客戶看）
3. 估價（可參考 `docs/pricing.md`）
4. 簽約（用範本）
5. 收訂金

### Phase 2：生成（30 分鐘內）

1. 開 Factory App → New Project
2. 跑完 8 步驟 Wizard
3. 確認 → 按下「生成」
4. 等待自動跑完（建 repo → push → 部署）
5. 收到生成完成 Email

### Phase 3：環境設定（1-2 天）

需客戶提供以下資料：

**金流方面：**
- 藍新：商店代號 / Hash Key / Hash IV
- 綠界：商店代號 / Hash Key / Hash IV  
- LINE Pay：Channel ID / Channel Secret
- 街口：Merchant ID / Secret
- TapPay：App ID / App Key / Partner Key
- Stripe：Publishable Key / Secret Key / Webhook Secret

**發票方面：**
- ezPay：商店代號 / Hash Key / Hash IV
- 綠界發票：商店代號 / Hash Key / Hash IV

**物流方面：**
- 黑貓：客戶代號 / API Key
- 7-11：契約代碼
- 全家：契約代碼

**通知方面：**
- LINE Messaging：Channel Access Token / Channel Secret
- 三竹簡訊：帳號 / 密碼

**分析方面：**
- GA4 Measurement ID
- Meta Pixel ID + Access Token
- TikTok Pixel ID（如有）

**內容方面：**
- Logo（高解析 PNG + SVG）
- favicon
- 品牌色（hex）
- 字型偏好
- 公司資訊（地址 / 電話 / 統編）
- 各種政策文件（隱私 / 條款 / 退款）

**做：**
1. 收齊後填入 `.env.production`
2. 各 provider 設定 callback URL：
   - 藍新：`https://[domain]/api/payment/newebpay/callback`
   - 綠界：`https://[domain]/api/payment/ecpay/callback`
   - ezPay：`https://[domain]/api/invoice/ezpay/callback`
   - ...
3. 設定 Webhook URL（Stripe 等）
4. 觸發重新部署

### Phase 4：內容上架（依模組）

**電商：**
1. 後台建分類
2. 上架商品（可批量匯入 CSV）
3. 設定運費規則
4. 設定優惠券（如有）
5. 設定行銷自動化（棄單回收等）

**課程：**
1. 上傳影片到 Bunny
2. 後台建課程結構
3. 對應 lesson 到 Bunny video ID
4. 設定試看單元
5. 設定完課條件 + 證書

**LP：**
1. 後台建 LP 頁面
2. 拖拉組合 block
3. 寫文案 + 上傳素材
4. 設定方案價格
5. 設定 OTO funnel
6. 預覽 + 發布

**形象站：**
1. 建立首頁 / 關於 / 服務 / 聯絡頁
2. 寫文案 + 上傳素材
3. 設定 SEO meta

**部落格：**
1. 建分類 / 標籤
2. 設定作者 profile
3. 發第一篇文章

### Phase 5：上線前檢查

**checklist：**

- [ ] 所有 .env 已填
- [ ] 金流測試交易成功（測試環境）
- [ ] 切換金流到正式環境
- [ ] 發票測試開立成功
- [ ] 物流測試建單成功
- [ ] Email 測試寄送成功
- [ ] LINE 測試發送成功
- [ ] SSL 憑證有效
- [ ] domain 已正確指向
- [ ] sitemap.xml 可訪問
- [ ] robots.txt 設定（上線前阻 / 上線後開）
- [ ] GA4 收到事件
- [ ] Meta Pixel 收到事件
- [ ] Sentry 接好
- [ ] 各頁面 OG image 正確
- [ ] 行動裝置全頁面測試
- [ ] 跨瀏覽器測試（Chrome / Safari / Edge）
- [ ] 性能 Lighthouse > 90
- [ ] 個資政策 + 服務條款 + 退款政策已上線
- [ ] Cookie consent 顯示
- [ ] 後台 2FA 已開啟（owner / admin 帳號）
- [ ] 備份機制確認運作

### Phase 6：上線

1. 客戶最後確認
2. 切換 robots.txt 開放索引
3. 提交 sitemap 到 Google Search Console
4. 切換正式 domain
5. 監控 24 小時（看 Sentry 有沒有大量錯誤）
6. 收尾款

### Phase 7：交付資料

寄客戶交付包：

- 後台帳密
- 各重要連結（前台 / 後台 / 報表 / Sentry）
- 操作手冊 PDF
- 教學影片連結
- 維護條款
- 客服窗口

### Phase 8：保固期（7-14 天）

- 客戶遇到問題優先處理
- 不算維護費
- 結束後進入維護階段

### Phase 9：維護階段

依合約執行：

- 月維護費收費
- 安全 patch 推送
- bug 修復
- 小幅功能加上去（每月 1-2 小時內免費）
- 大改另計

## 升級流程

template 主版升級時：

1. 客戶 repo 收到升級通知（自動 PR or Email）
2. 評估影響（看 changelog）
3. 預約升級時段（通常凌晨）
4. 跑 migration（DB schema）
5. 部署 + 觀察 1 小時
6. 確認穩定後關閉舊版

## 緊急狀況處理

**網站當機：**
1. 看 Sentry / Vercel 錯誤
2. 看是否近期部署造成 → rollback
3. 看是否第三方服務問題（Stripe / R2 / Bunny）
4. 通知客戶並回報原因

**金流壞：**
1. 第一時間切換到備援金流（如有）
2. 通知客戶
3. 對帳：受影響訂單列出
4. 處理失敗交易（退款 / 補單）

**資料外洩：**
1. 立即關閉受影響功能
2. 撤銷洩漏的 token
3. 通知客戶
4. 依個資法通報主管機關（48 小時內）
5. 通知受影響使用者（72 小時內）

## 計費建議

**建置費（一次性）：**

| 模組組合 | 建議價 |
|---|---|
| 純形象站 | NT$ 30,000 - 50,000 |
| 形象站 + 部落格 | NT$ 40,000 - 60,000 |
| 一頁式銷售（單支） | NT$ 35,000 - 55,000 |
| 完整電商（基本） | NT$ 80,000 - 150,000 |
| 完整電商（含進階行銷） | NT$ 150,000 - 250,000 |
| 課程平台（基本） | NT$ 100,000 - 180,000 |
| 課程平台（含 B2B） | NT$ 200,000 - 350,000 |
| 混合站（電商 + 課程 + LP） | NT$ 250,000 - 500,000 |

**月維護費：**

| 規格 | 建議價 |
|---|---|
| 小客戶（流量低） | NT$ 3,000 - 5,000 |
| 中客戶（穩定營運） | NT$ 8,000 - 15,000 |
| 大客戶（高流量 + 需求多） | NT$ 20,000 - 40,000 |

包含：

- 安全 patch
- 每月例行檢查
- bug 修復
- 1-2 小時客製需求
- Sentry / Uptime 監控
- 備份

不包含：

- 重大功能新增（另計）
- 大改版（另計）
- 客戶人為操作錯誤（協助處理另計）
- 第三方服務費用（金流手續費 / Vercel / Bunny 等客戶自付）
