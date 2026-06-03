# project.config.ts 完整型別

這份文件定義整套系統的「總開關」型別。所有功能模組要根據這個 config 決定是否載入與啟用。

```typescript
/**
 * 客戶專案總設定
 * 決定這個站要啟用哪些網站類型、模組、provider
 */
export interface ProjectConfig {
  /** 專案基本資訊 */
  meta: ProjectMeta;
  
  /** 啟用的網站類型（可複選） */
  siteTypes: SiteType[];
  
  /** 多店家設定 */
  tenancy: TenancyConfig;
  
  /** 各功能模組設定 */
  modules: ModulesConfig;
  
  /** Provider 設定（金流/物流/發票/通知） */
  providers: ProvidersConfig;
  
  /** 主題設定 */
  theme: ThemeConfig;
  
  /** SEO / 分析 */
  seo: SEOConfig;
  analytics: AnalyticsConfig;
  
  /** 多語系 */
  i18n: I18nConfig;
  
  /** 法規合規 */
  compliance: ComplianceConfig;
}

// ─── 基本資訊 ────────────────────────────────

export interface ProjectMeta {
  projectId: string;            // 內部識別
  clientName: string;           // 客戶名稱
  brandName: string;            // 品牌名稱
  domain: string;               // 主網域
  contactEmail: string;
  contactPhone?: string;
  businessRegistration?: string; // 統一編號
  createdAt: Date;
  version: string;              // 用於追蹤升級
}

// ─── 網站類型 ────────────────────────────────

export type SiteType = 
  | 'cms'      // 形象站
  | 'shop'     // 電商
  | 'course'   // 課程
  | 'lp'       // 一頁式
  | 'blog';    // 部落格

// ─── 多店家 ────────────────────────────────

export interface TenancyConfig {
  enabled: boolean;
  mode: 'single' | 'multi';
  tenants?: Tenant[];
  sharedMembers: boolean;       // 跨店共用會員
  sharedInventory: boolean;     // 跨店共用庫存
  sharedOrders: boolean;        // 跨店訂單統一看
}

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  enabledSiteTypes: SiteType[];
}

// ─── 模組設定 ────────────────────────────────

export interface ModulesConfig {
  shop?: ShopModuleConfig;
  course?: CourseModuleConfig;
  lp?: LPModuleConfig;
  cms?: CMSModuleConfig;
  blog?: BlogModuleConfig;
  marketing?: MarketingModuleConfig;
  reports?: ReportsModuleConfig;
}

// ── 電商模組 ──

export interface ShopModuleConfig {
  // 商品
  multiVariant: boolean;        // 多規格商品
  preOrder: boolean;            // 預購
  digitalProducts: boolean;     // 數位商品（下載碼）
  productVideo: boolean;        // 商品影片
  product3DAR: boolean;         // 3D/AR 預覽
  
  // 庫存
  inventory: {
    enabled: boolean;
    preDeduct: boolean;         // 預扣庫存
    preDeductTTL: number;       // 預扣保留秒數
    safetyStock: boolean;       // 安全庫存警示
    multiWarehouse: boolean;    // 多倉庫
    batchTracking: boolean;     // 批號管理
    crossChannelSync: boolean;  // 蝦皮 / momo 同步
  };
  
  // 購物車與結帳
  guestCheckout: boolean;       // 訪客結帳
  onePageCheckout: boolean;     // 一頁式結帳
  shippingCalculator: boolean;  // 即時運費試算
  
  // 會員
  memberTiers: boolean;         // 會員等級
  points: boolean;              // 點數
  storedValue: boolean;         // 儲值金
  birthdayReward: boolean;      // 生日禮
  
  // 行銷
  wishlist: boolean;
  reviews: boolean;
  upsell: {
    orderBump: boolean;         // Order Bump
    oneClickUpsell: boolean;    // 結帳完成頁加購
    crossSell: boolean;         // 相關商品
  };
  flashSale: boolean;
  groupBuy: boolean;
  subscription: boolean;        // 訂閱補貨
  
  // 退換貨
  returnRequest: boolean;       // 客戶申請退貨
  partialRefund: boolean;
  exchangeOrder: boolean;       // 換貨流程
  
  // Feeds
  feeds: {
    googleMerchant: boolean;
    metaCatalog: boolean;
    lineLAP: boolean;
    tiktok: boolean;
  };
  
  // 防詐刷
  fraudDetection: boolean;
}

// ── 課程模組 ──

export interface CourseModuleConfig {
  // 內容
  videoProvider: 'bunny' | 'mux';
  audioOnly: boolean;           // 音檔課程
  pdfWithAnnotations: boolean;  // PDF + 註記
  interactiveExercise: boolean; // 互動練習（CodeSandbox）
  
  // 影片保護
  watermark: {
    enabled: boolean;
    dynamic: boolean;           // 動態移動位置
    content: 'email' | 'phone' | 'custom';
  };
  drm: boolean;                 // Widevine / FairPlay
  deviceLimit: number;          // 同帳號裝置數（0 = 不限）
  
  // 學習體驗
  notesTimestamped: boolean;    // 時間戳筆記
  inVideoQuestion: boolean;     // 影片內提問
  speedMemory: boolean;         // 倍速記憶
  autoplay: boolean;            // 連續播放
  offlineDownload: boolean;     // 離線下載
  backgroundPlay: boolean;      // 背景播放
  
  // 評量
  quiz: boolean;
  assignment: boolean;
  peerReview: boolean;          // 同學互評
  
  // 完課
  certificate: {
    enabled: boolean;
    blockchain: boolean;        // 區塊鏈驗證
    linkedInShare: boolean;
    expiration: boolean;        // 證書到期制
  };
  
  // 社群
  discussion: boolean;
  studentDirectory: boolean;    // 學員 profile 互看
  externalCommunity: 'none' | 'line' | 'discord' | 'telegram';
  
  // 商業模式
  pricingMode: ('one-time' | 'subscription' | 'bundle' | 'pay-per-lesson')[];
  prelaunch: {
    crowdfunding: boolean;      // 募資
    earlyBird: boolean;         // 預售
  };
  
  // 直播課
  liveClass: {
    enabled: boolean;
    provider: 'zoom' | 'meet' | 'jitsi';
    autoRecord: boolean;
  };
  
  // B2B
  b2bEnterprise: boolean;       // 企業包班
  sso: ('saml' | 'oauth')[];    // 企業 SSO
  
  // 講師
  multiInstructor: boolean;
  instructorRevShare: boolean;
  
  // 認證
  certifications: {
    govLearningHours: boolean;  // 公務員學習時數
    cpe: boolean;               // 繼續教育學分
  };
}

// ── 一頁式模組 ──

export interface LPModuleConfig {
  // 編輯器
  blockEditor: boolean;         // 拖拉編輯器
  customBlocks: boolean;        // 允許客戶自訂 block
  versionControl: boolean;      // 頁面版本歷史
  scheduledPublish: boolean;    // 排程發布
  passwordProtectedPreview: boolean; // 預覽連結
  
  // 結帳
  formCheckout: boolean;        // 表單式下單（非購物車）
  cashOnDelivery: boolean;      // 貨到付款
  threeTierPricing: boolean;    // 三段式方案
  orderBump: boolean;
  oneClickUpsell: boolean;
  upsellLayers: number;         // OTO 層數（建議 2-3）
  
  // 轉換工具
  exitIntent: boolean;          // 離站挽留
  liveNotifications: boolean;   // 即時購買通知
  countdown: {
    enabled: boolean;
    mode: 'real' | 'dynamic';   // 真實 / 動態倒數
  };
  visitorCounter: boolean;      // 瀏覽人數
  floatingCTA: boolean;         // 浮動 CTA
  heroVideo: boolean;           // 自動播放靜音影片
  
  // 流量
  multipleVersions: boolean;    // 同產品多版本
  abTesting: boolean;
  utmTracking: boolean;
  customDomains: boolean;       // 多自訂網域
  
  // 速度
  amp: boolean;                 // AMP 加速
}

// ── 形象站模組 ──

export interface CMSModuleConfig {
  customPages: boolean;
  faq: boolean;
  contactForm: boolean;
  newsletter: boolean;
  teamProfile: boolean;
  portfolio: boolean;
  testimonials: boolean;
}

// ── 部落格模組 ──

export interface BlogModuleConfig {
  enabled: boolean;
  categories: boolean;
  tags: boolean;
  authors: boolean;
  comments: 'none' | 'native' | 'disqus';
  rssExport: boolean;
  relatedPosts: boolean;
  readingTime: boolean;
}

// ── 行銷模組 ──

export interface MarketingModuleConfig {
  // 自動化
  automation: {
    enabled: boolean;
    triggers: AutomationTrigger[];
  };
  
  // 棄單
  abandonedCart: {
    enabled: boolean;
    sequences: number;          // 幾段 follow-up
  };
  
  // 再行銷
  retargeting: boolean;
  
  // 推薦
  affiliate: {
    enabled: boolean;
    multiLevel: boolean;        // 多層分潤
  };
  referral: boolean;
  
  // 折扣
  coupons: boolean;
  
  // Banner
  bannerScheduler: boolean;
}

export type AutomationTrigger =
  | 'order.completed'
  | 'order.cancelled'
  | 'cart.abandoned'
  | 'user.signup'
  | 'user.birthday'
  | 'user.inactive'
  | 'product.viewed'
  | 'product.back-in-stock'
  | 'subscription.created'
  | 'subscription.cancelled'
  | 'course.enrolled'
  | 'course.completed'
  | 'lesson.completed'
  | 'lp.viewed'
  | 'lp.form-started';

// ── 報表模組 ──

export interface ReportsModuleConfig {
  dashboard: boolean;
  customReports: boolean;
  scheduledExport: boolean;
  comparisonViews: boolean;     // 跨期間比較
  forecasting: boolean;         // 預測模型
  anomalyAlerts: boolean;       // 異常告警
}

// ─── Provider 設定 ────────────────────────────────

export interface ProvidersConfig {
  payment: PaymentProviderConfig;
  invoice: InvoiceProviderConfig;
  shipping: ShippingProviderConfig;
  notification: NotificationProviderConfig;
  storage: StorageProviderConfig;
  video: VideoProviderConfig;
}

export interface PaymentProviderConfig {
  primary: PaymentProvider;
  enabled: {
    newebpay?: {
      methods: ('credit' | 'credit-installment' | 'atm' | 'cvs' | 'cvs-barcode' 
              | 'linepay' | 'applepay' | 'googlepay' | 'samsungpay' 
              | 'jkopay' | 'pi-wallet' | 'easycard' | 'esun-wallet')[];
      installmentPeriods?: (3 | 6 | 12 | 18 | 24)[];
    };
    ecpay?: {
      methods: ('credit' | 'atm' | 'cvs' | 'barcode' | 'webatm' | 'applepay' 
              | 'googlepay' | 'taiwanpay' | 'bnpl')[];
    };
    'linepay-official'?: boolean;
    'jkopay-official'?: boolean;
    tappay?: boolean;
    stripe?: {
      subscription: boolean;
      international: boolean;
    };
    paypal?: boolean;
    storedValue?: boolean;       // 儲值金
    enterpriseTransfer?: boolean; // B2B 匯款
  };
}

export type PaymentProvider = 'newebpay' | 'ecpay' | 'tappay' | 'stripe' | 'paypal';

export interface InvoiceProviderConfig {
  provider: 'ezpay' | 'ecpay-invoice' | 'none';
  mode: 'instant' | 'trigger' | 'scheduled';
  b2bSupport: boolean;
  carrierTypes: ('mobile' | 'natural-person' | 'donation' | 'company')[];
}

export interface ShippingProviderConfig {
  enabled: {
    blackcat?: boolean;
    hct?: boolean;
    '7eleven'?: { codCheckout: boolean };
    'family-mart'?: { codCheckout: boolean };
    hilife?: { codCheckout: boolean };
    post?: boolean;
    pickup?: boolean;            // 自取
    international?: ('ems' | 'dhl' | 'fedex')[];
    largeAppliance?: boolean;    // 大型物流
    coldChain?: boolean;         // 冷鏈
  };
  // 注意：未列入 'distance-based'（需 geo provider，列為 Phase 2）
  feeRules: 'fixed' | 'weight-based' | 'custom';
}

export interface NotificationProviderConfig {
  email: 'resend' | 'sendgrid' | 'mailgun';
  sms?: 'mitake' | 'twilio';
  line: {
    messagingAPI: boolean;
    officialAccount: boolean;
  };
  webPush: boolean;
}

export interface StorageProviderConfig {
  primary: 'r2' | 's3' | 'local';
  cdn: 'cloudflare' | 'bunny' | 'none';
}

export interface VideoProviderConfig {
  primary: 'bunny' | 'mux';
}

// ─── 主題 ────────────────────────────────

export interface ThemeConfig {
  preset: 'modern-minimal' | 'luxury' | 'playful' | 'corporate' | 'academy' | 'custom';
  tokens: DesignTokens;
  componentVariants?: Record<string, string>;
}

export interface DesignTokens {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
  };
  radius: 'sharp' | 'subtle' | 'soft' | 'extra-soft';  // 圓角程度
  fontFamily: {
    sans: string;
    serif: string;
    display: string;
  };
  spacing: 'tight' | 'normal' | 'spacious';
  shadow: 'flat' | 'subtle' | 'soft' | 'dramatic';
}

// ─── SEO ────────────────────────────────

export interface SEOConfig {
  defaultTitle: string;
  defaultDescription: string;
  defaultOGImage?: string;
  dynamicOGImage: boolean;       // 自動產 OG image
  schemaOrg: {
    organization: boolean;
    localBusiness: boolean;
    product: boolean;
    course: boolean;
    article: boolean;
    breadcrumb: boolean;
    faq: boolean;
    event: boolean;
  };
  sitemap: boolean;
  robots: boolean;
  hreflang: boolean;
}

// ─── 分析 ────────────────────────────────

export interface AnalyticsConfig {
  ga4?: { measurementId: string };
  metaPixel?: { 
    pixelId: string; 
    conversionAPI: boolean;       // CAPI（伺服器端）
    capiAccessToken?: string;
  };
  gtm?: { containerId: string };
  tiktokPixel?: { pixelId: string };
  linePixel?: { tagId: string };
  hotjar?: { siteId: string };
  postHog?: { apiKey: string };   // 內部用
}

// ─── 多語系 ────────────────────────────────

export interface I18nConfig {
  enabled: boolean;
  defaultLocale: Locale;
  locales: Locale[];
  fallbackLocale: Locale;
  multiCurrency: boolean;
  currencies: Currency[];
  multiTimezone: boolean;
}

export type Locale = 
  | 'zh-TW' | 'zh-CN' | 'en' | 'ja' | 'ko' | 'vi' | 'id' | 'th' | 'ms';

export interface Currency {
  code: 'TWD' | 'USD' | 'JPY' | 'EUR' | 'CNY' | 'KRW' | 'VND' | 'IDR' | 'THB' | 'MYR';
  symbol: string;
  rate?: number;                  // vs TWD
  taxIncluded: boolean;
}

// ─── 合規 ────────────────────────────────

export interface ComplianceConfig {
  cookieConsent: boolean;        // GDPR-like
  privacyPolicy: boolean;
  termsOfService: boolean;
  refundPolicy: boolean;
  
  taiwan: {
    personalDataAct: boolean;    // 個資法
    consumerProtectionAct: boolean; // 消保法
    sevenDayRefund: boolean;     // 7 天鑑賞期
    invoiceCompliance: boolean;
  };
  
  twoFactorAuth: boolean;        // 後台 2FA
  auditLog: boolean;             // 操作審計
  dataExport: boolean;           // 個資匯出（法定權利）
  dataDeletion: boolean;         // 個資刪除（法定權利）
}

// ─── 預設值 ────────────────────────────────

export const defaultConfig: Partial<ProjectConfig> = {
  siteTypes: ['cms'],
  tenancy: {
    enabled: false,
    mode: 'single',
    sharedMembers: false,
    sharedInventory: false,
    sharedOrders: false,
  },
  theme: {
    preset: 'modern-minimal',
    tokens: {
      colors: {
        primary: '#1a1a1a',
        secondary: '#666666',
        accent: '#0066ff',
        background: '#ffffff',
        foreground: '#1a1a1a',
      },
      radius: 'soft',              // 預設圓角風（你的偏好）
      fontFamily: {
        sans: 'system-ui',
        serif: 'Georgia',
        display: 'system-ui',
      },
      spacing: 'normal',
      shadow: 'subtle',
    },
  },
  i18n: {
    enabled: false,
    defaultLocale: 'zh-TW',
    locales: ['zh-TW'],
    fallbackLocale: 'zh-TW',
    multiCurrency: false,
    currencies: [{
      code: 'TWD',
      symbol: 'NT$',
      taxIncluded: true,
    }],
    multiTimezone: false,
  },
  compliance: {
    cookieConsent: true,
    privacyPolicy: true,
    termsOfService: true,
    refundPolicy: true,
    taiwan: {
      personalDataAct: true,
      consumerProtectionAct: true,
      sevenDayRefund: true,
      invoiceCompliance: true,
    },
    twoFactorAuth: true,
    auditLog: true,
    dataExport: true,
    dataDeletion: true,
  },
};
```
