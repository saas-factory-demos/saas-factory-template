# 整體架構

## Monorepo 結構

```
saas-factory/
├── apps/
│   ├── factory/                    # 內部勾選生成後台（你自己用）
│   │   ├── app/
│   │   ├── components/
│   │   └── package.json
│   │
│   └── template/                   # 主程式範本（每個客戶站的起點）
│       ├── app/
│       │   ├── (cms)/              # 形象站前台
│       │   ├── (shop)/             # 電商前台
│       │   ├── (course)/           # 課程前台
│       │   ├── (lp)/[slug]/        # 一頁式頁面
│       │   ├── (blog)/             # 部落格
│       │   ├── (admin)/            # Payload 後台路由
│       │   └── api/                # API routes（callback / webhook）
│       ├── payload.config.ts       # Payload 設定
│       ├── project.config.ts       # ⭐ 功能開關核心
│       └── package.json
│
├── packages/
│   ├── core/                       # 核心必裝
│   │   ├── auth/                   # 會員、登入、OAuth、角色權限、2FA
│   │   ├── email/                  # Resend 抽象層
│   │   ├── upload/                 # R2 / S3 抽象層 + 圖片優化
│   │   ├── i18n/                   # 多語系（中/英/日/韓/越/印尼）
│   │   ├── analytics/              # GA4 / Meta Pixel / Conversion API
│   │   ├── tenants/                # 多店家架構
│   │   ├── crm/                    # 客戶標籤系統 + 溝通歷史
│   │   └── audit-log/              # 操作審計
│   │
│   ├── payment/                    # 金流抽象層 + 各 provider
│   │   ├── core/                   # PaymentProvider 介面
│   │   ├── newebpay/               # 藍新（信用卡/分期/ATM/超商/LINE Pay/Apple Pay）
│   │   ├── ecpay/                  # 綠界
│   │   ├── linepay-official/       # LINE Pay 官方
│   │   ├── jkopay-official/        # 街口官方
│   │   ├── tappay/                 # TapPay（高階）
│   │   ├── stripe/                 # 國際信用卡 + 訂閱
│   │   └── paypal/                 # PayPal
│   │
│   ├── invoice/                    # 發票
│   │   ├── core/
│   │   ├── ezpay/                  # ezPay
│   │   └── ecpay-invoice/          # 綠界發票
│   │
│   ├── shipping/                   # 物流
│   │   ├── core/
│   │   ├── blackcat/               # 黑貓
│   │   ├── hct/                    # 新竹貨運
│   │   ├── 7eleven/                # 7-11
│   │   ├── family-mart/            # 全家
│   │   ├── hilife/                 # 萊爾富
│   │   ├── post/                   # 中華郵政
│   │   └── international/          # EMS / DHL / FedEx
│   │
│   ├── notification/               # 通知
│   │   ├── core/                   # 通知中心
│   │   ├── email/
│   │   ├── sms-mitake/             # 三竹簡訊
│   │   ├── line-messaging/         # LINE Messaging API
│   │   └── push-web/               # Web Push
│   │
│   ├── shop/                       # 電商模組
│   │   ├── products/               # 商品 + 多規格
│   │   ├── inventory/              # 庫存（含跨通路同步、批號）
│   │   ├── cart/                   # 購物車
│   │   ├── checkout/               # 一頁式結帳 + 訪客結帳
│   │   ├── orders/                 # 訂單管理（含合併、拆單、退換）
│   │   ├── discount-engine/        # ⭐ 折扣引擎（rule-based）
│   │   ├── coupons/                # 優惠券（用折扣引擎）
│   │   ├── member-tier/            # 會員等級
│   │   ├── points/                 # 點數
│   │   ├── wishlist/               # 願望清單
│   │   ├── reviews/                # 商品評價
│   │   ├── upsell/                 # Order Bump + One-Click Upsell
│   │   ├── subscription/           # 訂閱補貨
│   │   └── feeds/                  # Google Merchant / Meta Catalog
│   │
│   ├── course/                     # 課程模組
│   │   ├── content/                # 課程/章節/單元
│   │   ├── enrollment/             # 報名 + 權限
│   │   ├── progress/               # 學習進度（跨裝置）
│   │   ├── video-bunny/            # Bunny.net 串流
│   │   ├── video-mux/              # Mux 備選
│   │   ├── watermark/              # 動態浮水印
│   │   ├── device-limit/           # 裝置數限制
│   │   ├── quiz/                   # 測驗
│   │   ├── assignment/             # 作業
│   │   ├── certificate/            # 證書 PDF + 區塊鏈驗證
│   │   ├── discussion/             # 討論區 + 時間戳提問
│   │   ├── notes/                  # 學習筆記時間戳
│   │   ├── live-class/             # 直播課（Zoom/Meet）
│   │   ├── b2b/                    # 企業包班
│   │   └── instructor/             # 講師後台 + 分潤
│   │
│   ├── lp/                         # 一頁式銷售網站
│   │   ├── builder/                # 區塊式編輯器
│   │   ├── blocks/                 # 預設 12 種 block
│   │   ├── checkout-form/          # LP 表單結帳（非購物車）
│   │   ├── exit-intent/            # 離站挽留彈窗
│   │   ├── countdown/              # 倒數計時
│   │   ├── live-notifications/     # 即時購買通知
│   │   ├── ab-testing/             # A/B 測試
│   │   └── analytics/              # LP 專屬轉換率分析
│   │
│   ├── cms/                        # 形象站基礎
│   │   ├── pages/                  # 自訂頁面（block 式）
│   │   ├── blog/                   # 部落格
│   │   ├── faq/                    # FAQ
│   │   ├── forms/                  # 聯絡表單
│   │   └── seo/                    # SEO 工具集
│   │
│   ├── marketing/                  # 行銷自動化
│   │   ├── automation-engine/      # ⭐ 觸發 → 條件 → 動作引擎
│   │   ├── abandoned-cart/         # 棄單回收
│   │   ├── retargeting/            # 再行銷
│   │   ├── affiliate/              # 聯盟分潤
│   │   ├── referral/               # 推薦好友
│   │   ├── flash-sale/             # 快閃倒數
│   │   ├── group-buy/              # 團購
│   │   ├── banner/                 # Banner 排程
│   │   └── ab-test-framework/      # 跨類型 A/B 框架
│   │
│   ├── themes/                     # 主題系統
│   │   ├── core/                   # design tokens 引擎
│   │   ├── modern-minimal/
│   │   ├── luxury/
│   │   ├── playful/
│   │   ├── corporate/
│   │   └── academy/
│   │
│   ├── ui/                         # 共用 UI 元件
│   │   ├── primitives/             # shadcn 基礎
│   │   ├── shop/                   # 電商專用元件
│   │   ├── course/                 # 課程專用元件
│   │   └── lp/                     # LP 專用元件
│   │
│   ├── reports/                    # 報表中心
│   │   ├── dashboard/              # 老闆儀表板
│   │   ├── sales/                  # 銷售報表
│   │   ├── customers/              # 客戶分析
│   │   ├── conversion/             # 轉換率漏斗
│   │   └── export/                 # 匯出 Excel/CSV
│   │
│   └── config/                     # 共用設定
│       ├── eslint/
│       ├── typescript/
│       └── tailwind/
│
├── docs/
│   ├── progress/                   # 各 goal 完成報告
│   ├── decisions/                  # 架構決策紀錄（ADR）
│   ├── api/                        # API 文件
│   └── customer/                   # 客戶交付文件範本
│
└── scripts/
    ├── new-client.ts               # 生成新客戶專案
    └── deploy.ts                   # 部署腳本
```

## 關鍵設計原則

### 1. Config 驅動

`project.config.ts` 是整套系統的靈魂。**所有功能開關都在這裡**，包括：

- 啟用哪幾種網站類型
- 啟用哪些金流 provider
- 啟用哪些行銷工具
- 主題設定
- 多店家設定

未啟用的模組透過 dynamic import 或 tree-shaking 完全不載入，bundle size 不受影響。

### 2. Provider 抽象層

金流、物流、發票、通知、影片串流都用**統一介面 + 多實作**。換 provider 只是改 config。

### 3. 折扣引擎跨模組通用

「折扣」不綁定電商。一個 rule-based 引擎服務電商商品、課程價格、LP 方案、訂閱方案。

### 4. 行銷自動化引擎跨模組通用

「觸發 → 條件 → 動作」引擎服務所有類型。電商棄單、課程沉睡學員、LP 訪客追蹤都用同一個引擎。

### 5. 多店家（Multi-Tenant）優先

每個客戶可能會問「能不能架兩個品牌站」。從第一行 code 就考慮 tenancy，後期不用重構。

### 6. 主題系統 = Design Tokens + 元件變體

主題不是只換顏色。包含：顏色、字體、圓角、間距、陰影、動畫、元件 variant。客戶要客製只動 tokens。

## 流程：從接案到上線

```
1. 客戶來談需求
   ↓
2. 你開啟 apps/factory（內部後台）
   ↓
3. 勾選功能 + 上傳 logo + 選主題色
   ↓
4. 按下「生成專案」
   ↓
5. 系統自動：
   - Clone template repo 為新 repo
   - 寫入 project.config.ts
   - 套主題
   - push 到 GitHub
   - 觸發 Vercel 部署
   - 初始化 Payload admin
   - 寄 Email 給你（admin 帳密 + 客戶網址 + .env 待填清單）
   ↓
6. 你填入 .env（客戶提供的金流、物流、發票金鑰）
   ↓
7. 客戶開始用後台上商品 / 課程 / LP
   ↓
8. 上線交付
```

整個流程從接案到開發環境上線：**1 天內**。

從上商品到正式營運：**3-7 天**。

## 維護策略

- 所有客戶共用同一個 monorepo template
- 客戶 fork 後固定特定 tag（不自動跟主版本）
- 每季開放升級（收升級維護費 NT$5,000-15,000/客戶）
- 安全性更新（CVE）免費推送
- 所有客戶站接同一個 Sentry 專案（你監控）
